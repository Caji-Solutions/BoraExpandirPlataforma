import { Composio } from '@composio/core';
import { supabase } from '../config/SupabaseClient';

interface CalendarEventData {
  summary: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendees?: string[];
  location?: string;
  timeZone?: string;
}

interface CalendarEventResponse {
  success: boolean;
  eventId?: string;
  eventLink?: string;
  error?: string;
}

class ComposioService {
  private composio: Composio;

  constructor() {
    // Inicializa Composio com a API key do .env
    this.composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY || '',
    });
  }

  /**
   * Cria um evento no Google Calendar
   * @param userId - ID do usuário (entity ID)
   * @param eventData - Dados do evento a ser criado
   * @returns Resposta com ID e link do evento criado
   */
  async createCalendarEvent(
    userId: string,
    eventData: CalendarEventData
  ): Promise<CalendarEventResponse> {
    try {
      console.log('🗓️ Criando evento no Google Calendar...', {
        userId,
        summary: eventData.summary,
        startTime: eventData.startTime,
      });

      // Formata as datas no formato esperado pela API do Composio
      // Formato: YYYY-MM-DDTHH:MM:SS (sem timezone, será adicionado pelo parâmetro timezone)
      const formatDateTime = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      };

      const startDateTime = formatDateTime(eventData.startTime);
      const timezone = eventData.timeZone || 'America/Sao_Paulo';

      // Calcula a duração em horas e minutos
      const durationMs = eventData.endTime.getTime() - eventData.startTime.getTime();
      const durationMinutes = Math.floor(durationMs / 60000);
      const eventDurationHour = Math.floor(durationMinutes / 60);
      const eventDurationMinutes = durationMinutes % 60;

      // Prepara os attendees no formato correto
      const attendees = eventData.attendees || [];

      // Executa a ação do Google Calendar através do Composio
        const response = await this.composio.tools.execute(
  "GOOGLECALENDAR_CREATE_EVENT",
  {
    userId,
    version: "20260203_00",
    arguments: {
      summary: eventData.summary,
      description: eventData.description ?? "",
      start_datetime: startDateTime,
      timezone: timezone,
      event_duration_hour: eventDurationHour,
      event_duration_minutes: eventDurationMinutes,
      attendees,
      location: eventData.location ?? "",
      send_updates: true,
    },
  }
);


      console.log('✅ Evento criado com sucesso!');
      console.log('📦 Resposta completa:', JSON.stringify(response, null, 2));

      // A resposta do Composio tem estrutura: { data: { response_data: {...} }, error, successful }
      const data = response?.data as Record<string, unknown>;
      const responseData = (data?.response_data as Record<string, unknown>) || data;
      const eventId = responseData?.id || responseData?.event_id || responseData?.eventId;
      const eventLink = responseData?.hangoutLink || responseData?.htmlLink || responseData?.html_link;

      console.log('🔍 EventId extraido:', eventId);
      console.log('🔗 EventLink extraido:', eventLink);

      return {
        success: true,
        eventId: eventId as string,
        eventLink: eventLink as string,
      };
    } catch (error: any) {
      console.error('❌ Erro ao criar evento no Google Calendar:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
        status: error.response?.status,
        fullError: JSON.stringify(error, null, 2),
      });
      return {
        success: false,
        error: error.message || 'Erro desconhecido ao criar evento',
      };
    }
  }

  /**
   * Atualiza um evento existente no Google Calendar
   * @param userId - ID do usuário
   * @param eventId - ID do evento a ser atualizado
   * @param eventData - Novos dados do evento
   */
  async updateCalendarEvent(
    userId: string,
    eventId: string,
    eventData: Partial<CalendarEventData>
  ): Promise<CalendarEventResponse> {
    try {
      console.log('🔄 Atualizando evento no Google Calendar...', {
        userId,
        eventId,
      });

      const updateParams: any = { event_id: eventId };

      if (eventData.summary) updateParams.summary = eventData.summary;
      if (eventData.description) updateParams.description = eventData.description;
      if (eventData.location) updateParams.location = eventData.location;

      if (eventData.startTime && eventData.endTime) {
        const formatDateTime = (date: Date): string => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const seconds = String(date.getSeconds()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        };

        updateParams.start_datetime = formatDateTime(eventData.startTime);
        updateParams.timezone = eventData.timeZone || 'America/Sao_Paulo';

        const durationMs = eventData.endTime.getTime() - eventData.startTime.getTime();
        const durationMinutes = Math.floor(durationMs / 60000);
        updateParams.event_duration_hour = Math.floor(durationMinutes / 60);
        updateParams.event_duration_minutes = durationMinutes % 60;
      }

      if (eventData.attendees) {
        updateParams.attendees = eventData.attendees;
      }

      updateParams.send_updates = true;

      const response: any = await this.composio.tools.execute(
        userId,
        'GOOGLECALENDAR_UPDATE_EVENT' as any,
        updateParams
      );

      console.log('✅ Evento atualizado com sucesso:', response);

      const rawData = response?.data || response;
      const data = (rawData?.response_data as Record<string, unknown>) || rawData;

      return {
        success: true,
        eventId: data?.id as string,
        eventLink: (data?.hangoutLink || data?.htmlLink || data?.html_link) as string,
      };
    } catch (error: any) {
      console.error('❌ Erro ao atualizar evento:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
        fullError: JSON.stringify(error, null, 2),
      });
      return {
        success: false,
        error: error.message || 'Erro desconhecido ao atualizar evento',
      };
    }
  }

  /**
   * Cancela/deleta um evento do Google Calendar
   * @param userId - ID do usuário
   * @param eventId - ID do evento a ser deletado
   */
  async deleteCalendarEvent(
    userId: string,
    eventId: string
  ): Promise<CalendarEventResponse> {
    try {
      console.log('🗑️ Deletando evento do Google Calendar...', {
        userId,
        eventId,
      });

      await this.composio.tools.execute(
        userId,
        'GOOGLECALENDAR_DELETE_EVENT' as any,
        {
          event_id: eventId,
        } as any
      );

      console.log('✅ Evento deletado com sucesso');

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('❌ Erro ao deletar evento:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
        fullError: JSON.stringify(error, null, 2),
      });
      return {
        success: false,
        error: error.message || 'Erro desconhecido ao deletar evento',
      };
    }
  }

  /**
   * Gera URL de conexão para o usuário autenticar com Google Calendar
   * @param userId - ID único do usuário
   * @returns URL de redirecionamento para autenticação
   */
  async getConnectionUrl(userId: string): Promise<string> {
    try {
      // Cria sessão para obter URL de autenticação
      const session = await this.composio.create(userId, {
        toolkits: ['googlecalendar'],
      });
      
      const connectionRequest = await session.authorize('googlecalendar', {
        callbackUrl: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/calendar/callback?userId=${encodeURIComponent(userId)}`,
      });

      return connectionRequest.redirectUrl || '';
    } catch (error: any) {
      console.error('❌ Erro ao gerar URL de conexao:', error);
      throw new Error('Não foi possível gerar URL de autenticação');
    }
  }

  /**
   * Verifica se o usuário tem conexão ativa com Google Calendar
   * @param userId - ID do usuário
   */
  async isConnected(userId: string): Promise<boolean> {
    try {
      console.log('🔍 Verificando conexao para userId:', userId);
      
      const session = await this.composio.create(userId, {
        toolkits: ['googlecalendar'],
      });
      
      console.log('📦 Session criada, buscando toolkits...');
      const toolkits = await session.toolkits();
      
      console.log('📋 Toolkits encontrados:', JSON.stringify(toolkits, null, 2));

      // Procura pelo toolkit do Google Calendar usando o slug
      const googleCalendar = toolkits.items.find(
        (toolkit) => toolkit.slug === 'googlecalendar'
      );

      console.log('📅 Google Calendar toolkit:', JSON.stringify(googleCalendar, null, 2));
      console.log('🔗 Connection:', googleCalendar?.connection);
      console.log('✅ isActive:', googleCalendar?.connection?.isActive);

      return googleCalendar?.connection?.isActive || false;
    } catch (error) {
      console.error('❌ Erro ao verificar conexao:', error);
      return false;
    }
  }

  /**
   * Obtém detalhes da conexão do Google Calendar do usuário a partir do banco de dados local
   * @param userId - ID do usuário
   */
  async getConnectionDetails(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('google_calendar_connections')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return { isConnected: false };
      }

      return {
        isConnected: true,
        connectionId: data.connected_account_id,
        account: {
          connectedAccountId: data.connected_account_id,
          email: data.email,
          isActive: true,
        },
      };
    } catch (error) {
      console.error('❌ Erro ao buscar detalhes da conexao:', error);
      return { isConnected: false };
    }
  }

  /**
   * Desconecta/remove a conta do Google Calendar para o usuário
   * @param userId - ID do usuário
   */
  async disconnectCalendar(userId: string): Promise<boolean> {
    try {
      console.log('🔌 Desconectando o Google Calendar para userId:', userId);

      const { data, error } = await supabase
        .from('google_calendar_connections')
        .select('connected_account_id')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        console.log('⚠️ Nenhuma conexao ativa encontrada para remover.');
        return false;
      }

      await this.composio.connectedAccounts.delete(data.connected_account_id as string);

      await supabase
        .from('google_calendar_connections')
        .delete()
        .eq('user_id', userId);

      console.log('✅ Conexao removida com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao desconectar Google Calendar:', error);
      return false;
    }
  }
}

export default new ComposioService();
export type { CalendarEventData, CalendarEventResponse };
