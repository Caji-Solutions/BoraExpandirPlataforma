import { Request, Response } from 'express';
import composioService from '../services/ComposioService';

class CalendarController {
  /**
   * Cria um novo evento no Google Calendar
   * POST /api/calendar/events
   * Body: {
   *   userId: string,
   *   summary: string,
   *   description?: string,
   *   startTime: string (ISO),
   *   endTime: string (ISO),
   *   attendees?: string[],
   *   location?: string,
   *   timeZone?: string
   * }
   */
  async createEvent(req: Request, res: Response) {
    try {
      const {
        userId,
        summary,
        description,
        startTime,
        endTime,
        attendees,
        location,
        timeZone,
      } = req.body;

      // Validações básicas
      if (!userId || !summary || !startTime || !endTime) {
        return res.status(400).json({
          success: false,
          error: 'userId, summary, startTime e endTime são obrigatórios',
        });
      }

      // Converte strings ISO para Date
      const startDate = new Date(startTime);
      const endDate = new Date(endTime);

      // Valida se as datas são válidas
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'startTime ou endTime inválidos',
        });
      }

      // Valida se endTime é depois de startTime
      if (endDate <= startDate) {
        return res.status(400).json({
          success: false,
          error: 'endTime deve ser posterior a startTime',
        });
      }

      const result = await composioService.createCalendarEvent(userId, {
        summary,
        description,
        startTime: startDate,
        endTime: endDate,
        attendees,
        location,
        timeZone,
      });

      return res.status(result.success ? 200 : 500).json(result);
    } catch (error: any) {
      console.error('❌ Erro no CalendarController.createEvent:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Erro ao criar evento',
      });
    }
  }

  /**
   * Atualiza um evento existente
   * PUT /api/calendar/events/:eventId
   * Body: {
   *   userId: string,
   *   summary?: string,
   *   description?: string,
   *   startTime?: string (ISO),
   *   endTime?: string (ISO),
   *   attendees?: string[],
   *   location?: string,
   *   timeZone?: string
   * }
   */
  async updateEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const {
        userId,
        summary,
        description,
        startTime,
        endTime,
        attendees,
        location,
        timeZone,
      } = req.body;

      if (!userId || !eventId) {
        return res.status(400).json({
          success: false,
          error: 'userId e eventId são obrigatórios',
        });
      }

      const eventData: any = {};

      if (summary) eventData.summary = summary;
      if (description) eventData.description = description;
      if (location) eventData.location = location;
      if (attendees) eventData.attendees = attendees;
      if (timeZone) eventData.timeZone = timeZone;

      if (startTime && endTime) {
        const startDate = new Date(startTime);
        const endDate = new Date(endTime);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return res.status(400).json({
            success: false,
            error: 'startTime ou endTime inválidos',
          });
        }

        if (endDate <= startDate) {
          return res.status(400).json({
            success: false,
            error: 'endTime deve ser posterior a startTime',
          });
        }

        eventData.startTime = startDate;
        eventData.endTime = endDate;
      }

      const result = await composioService.updateCalendarEvent(
        userId,
        eventId,
        eventData
      );

      return res.status(result.success ? 200 : 500).json(result);
    } catch (error: any) {
      console.error('❌ Erro no CalendarController.updateEvent:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Erro ao atualizar evento',
      });
    }
  }

  /**
   * Deleta um evento
   * DELETE /api/calendar/events/:eventId
   * Query: userId=string
   */
  async deleteEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const { userId } = req.query;

      if (!userId || !eventId) {
        return res.status(400).json({
          success: false,
          error: 'userId e eventId são obrigatórios',
        });
      }

      const result = await composioService.deleteCalendarEvent(
        userId as string,
        eventId
      );

      return res.status(result.success ? 200 : 500).json(result);
    } catch (error: any) {
      console.error('❌ Erro no CalendarController.deleteEvent:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Erro ao deletar evento',
      });
    }
  }

  /**
   * Obtém URL de conexão para autenticar com Google Calendar
   * GET /api/calendar/connect?userId=string
   */
  async getConnectionUrl(req: Request, res: Response) {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId é obrigatório',
        });
      }

      const url = await composioService.getConnectionUrl(userId as string);

      return res.redirect(url);
    } catch (error: any) {
      console.error('❌ Erro no CalendarController.getConnectionUrl:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Erro ao gerar URL de conexão',
      });
    }
  }

  /**
   * Verifica se o usuário está conectado ao Google Calendar
   * GET /api/calendar/status?userId=string
   */
  async getConnectionStatus(req: Request, res: Response) {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId é obrigatório',
        });
      }

      const connectionInfo = await composioService.getConnectionDetails(userId as string);

      return res.status(200).json({
        success: true,
        isConnected: connectionInfo.isConnected,
        connection: connectionInfo.isConnected ? connectionInfo.account : null
      });
    } catch (error: any) {
      console.error('❌ Erro no CalendarController.getConnectionStatus:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Erro ao verificar status de conexão',
      });
    }
  }

  /**
   * Desconecta o usuário do Google Calendar
   * DELETE /api/calendar/disconnect?userId=string
   */
  async disconnect(req: Request, res: Response) {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId é obrigatório',
        });
      }

      const success = await composioService.disconnectCalendar(userId as string);

      return res.status(200).json({
        success,
        message: success ? 'Desconectado com sucesso' : 'Falha ao desconectar ou conta não conectada'
      });
    } catch (error: any) {
      console.error('❌ Erro no CalendarController.disconnect:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Erro ao desconectar conta',
      });
    }
  }

  /**
   * Processa o callback do OAuth após autorização do Google Calendar
   * GET /api/calendar/callback?status=success|failed&connected_account_id=string
   */
  async handleCallback(req: Request, res: Response) {
    try {
      const { status, connected_account_id } = req.query;

      console.log('📥 Callback OAuth recebido:', { status, connected_account_id });

      if (status === 'success' && connected_account_id) {
        // Retorna uma página HTML simples de sucesso
        return res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Conexão Estabelecida</title>
            <style>
              body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
              .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); text-align: center; max-width: 400px; }
              h1 { color: #22c55e; margin-bottom: 16px; }
              p { color: #666; margin-bottom: 24px; }
              .account-id { background: #f3f4f6; padding: 8px 16px; border-radius: 8px; font-family: monospace; font-size: 12px; color: #374151; }
              .close-btn { background: #667eea; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px; margin-top: 16px; }
              .close-btn:hover { background: #5a67d8; }
              .back-btn { background: #4b5563; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px; margin-top: 16px; margin-left: 8px; }
              .back-btn:hover { background: #374151; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>✅ Conectado!</h1>
              <p>Sua conta do Google Calendar foi conectada com sucesso. Você pode fechar esta aba com segurança.</p>
              <div class="account-id">Account ID: ${connected_account_id}</div>
              <div style="display: flex; justify-content: center; align-items: center;">
                <button class="close-btn" onclick="window.close()">Fechar Aba</button>
                <button class="back-btn" onclick="window.location.href = '${process.env.FRONTEND_URL || 'http://localhost:5174'}/admin'">Dashboard</button>
              </div>
            </div>
          </body>
          </html>
        `);
      } else {
        // Retorna uma página de erro
        return res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Erro na Conexão</title>
            <style>
              body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); }
              .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); text-align: center; max-width: 400px; }
              h1 { color: #ef4444; margin-bottom: 16px; }
              p { color: #666; margin-bottom: 24px; }
              .close-btn { background: #ff6b6b; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px; margin-top: 16px; }
              .close-btn:hover { background: #fa5252; }
              .back-btn { background: #4b5563; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px; margin-top: 16px; margin-left: 8px; }
              .back-btn:hover { background: #374151; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>❌ Erro na Conexão</h1>
              <p>Não foi possível conectar sua conta do Google Calendar. Por favor, tente novamente.</p>
              <div style="display: flex; justify-content: center; align-items: center;">
                <button class="close-btn" onclick="window.close()">Fechar Aba</button>
                <button class="back-btn" onclick="window.location.href = '${process.env.FRONTEND_URL || 'http://localhost:5174'}/admin'">Dashboard</button>
              </div>
            </div>
          </body>
          </html>
        `);
      }
    } catch (error: any) {
      console.error('❌ Erro no CalendarController.handleCallback:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Erro ao processar callback',
      });
    }
  }
}

export default new CalendarController();
