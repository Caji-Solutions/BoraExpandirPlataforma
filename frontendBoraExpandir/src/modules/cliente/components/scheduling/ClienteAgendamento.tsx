import React from 'react'
import Comercial1 from '../../../comercial/Comercial1'
import { Client } from '../../types'

interface ClienteAgendamentoProps {
    client: Client
}

export function ClienteAgendamento({ client }: ClienteAgendamentoProps) {
    // Map client data to match Comercial1 expected format
    const comercialClient = {
        id: client.id,
        nome: client.name,
        email: client.email,
        telefone: client.phone || '',
    }

    return (
        <div className="bg-gray-50 dark:bg-neutral-900 min-h-screen">
            <Comercial1 preSelectedClient={comercialClient} isClientView={true} />
        </div>
    )
}
