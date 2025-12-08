import React, { useState } from "react";
import type { Icon as LucideIcon } from "lucide-react";
import { Phone, MessageCircle } from "lucide-react";

interface LeadCaptureProps {
	partnerName: string;
	partnerId: string;
	partnerAvatarUrl?: string;
	logoUrl?: string;
}

export default function LeadCapturePage({ partnerName, partnerId, partnerAvatarUrl, logoUrl = "/assets/bora-logo.png" }: LeadCaptureProps) {
	const [nome, setNome] = useState("");
	const [email, setEmail] = useState("");
	const [whats, setWhats] = useState("");
	const [loading, setLoading] = useState(false);

	const initials = partnerName
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((s) => s[0]?.toUpperCase())
		.join("");

	const isMobileDevice = () => {
		const userAgent = navigator.userAgent.toLowerCase();
		return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!nome.trim() || !email.trim() || !whats.trim()) return;
		setLoading(true);
		try {
			/*
			// Salvar lead no backend
			const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cliente/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					nome,
					email,
					whatsapp: whats,
					parceiro_id: partnerId,
				}),
			});
			if (!res.ok) {
				console.error('Erro ao salvar lead:', await res.text());
			}*/
			// Redirecionar para WhatsApp
			const digits = whats.replace(/\D/g, "");
			const msg = encodeURIComponent(`Olá, sou ${nome}, vim indicado por ${partnerName}.`);
			
			// Detectar dispositivo e redirecionar apropriadamente
			const isMobile = isMobileDevice();
			const waUrl = isMobile 
				? `whatsapp://send?phone=552997892095&text=${msg}`
				: `https://web.whatsapp.com/send?phone=552997892095&text=${msg}`;
					
			console.log('User Agent:', navigator.userAgent);
			console.log('Is Mobile:', isMobile);
			console.log('WhatsApp URL:', waUrl);
			 // Abrir em nova aba
            window.open(waUrl, '_blank');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
			<div className="w-full max-w-md">
				<div className="mb-6 text-center">
					<div className="inline-flex items-center gap-2 justify-center">
												<img
													src={logoUrl}
													alt="Empresa"
													className="rounded-sm object-contain h-14 w-auto max-w-[180px] md:h-16 md:max-w-[220px]"
													onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
												/>
					
					</div>
				</div>

				<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
					<div className="flex items-center justify-center mb-4">
						{partnerAvatarUrl ? (
							<img src={partnerAvatarUrl} alt={partnerName} className="h-10 w-10 rounded-full object-cover" />
						) : (
							<div className="h-10 w-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-semibold">
								{initials || "P"}
							</div>
						)}
					</div>
					<h1 className="text-center text-lg font-semibold">Você foi indicado por <span className="font-bold">{partnerName}</span></h1>
					<p className="mt-1 text-center text-sm text-gray-600">Preencha seus dados para começarmos o atendimento.</p>

					<form onSubmit={handleSubmit} className="mt-6 space-y-4">
					<div>
						<label className="block text-sm font-medium mb-1">Seu Nome</label>
						<input
							type="text"
							value={nome}
							onChange={(e) => setNome(e.target.value)}
							placeholder="Ex: Maria Souza"
							className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-1">Seu E-mail</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="email@exemplo.com"
							className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-1">Seu WhatsApp</label>
							<div className="relative">
								<Phone className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
								<input
									type="tel"
									value={whats}
									onChange={(e) => setWhats(e.target.value)}
									placeholder="(11) 98888-7777"
									className="w-full rounded-lg border border-gray-200 bg-white pl-9 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
								/>
							</div>
						</div>

						<button
							type="submit"
							disabled={loading || !nome.trim() || !whats.trim()}
							className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-60"
						>
							<MessageCircle className="h-5 w-5" />
							{loading ? "Redirecionando..." : "Continuar para o WhatsApp"}
						</button>

						<p className="text-center text-xs text-gray-500">
							Seus dados estão seguros. Iniciaremos o atendimento imediatamente.
						</p>
					</form>
				</div>
			</div>
		</div>
	);
}



