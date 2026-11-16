import React, { useState } from 'react';
import { FareAnalysis, FareCharge, TripPlan } from '../../../types.ts';
import { analyzeFare } from '../../../services/apiService.ts';

// O usuário cola a tarifa que achou num site real; a IA só analisa esse texto
// (custo total, taxas evitáveis, risco de cancelar/remarcar). Não busca preço.

const MAX_CHARS = 8000;

const TIPO_LABEL: Record<FareCharge['tipo'], { label: string; cls: string }> = {
    inevitavel: { label: 'Inevitável', cls: 'bg-red-100 text-red-800' },
    provavel: { label: 'Provável', cls: 'bg-amber-100 text-amber-800' },
    opcional: { label: 'Opcional', cls: 'bg-gray-200 text-gray-700' },
};

interface FareAnalyzerProps {
    trip: TripPlan;
    formatter: Intl.NumberFormat;
}

export const FareAnalyzer: React.FC<FareAnalyzerProps> = ({ trip, formatter }) => {
    const [fareText, setFareText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<FareAnalysis | null>(null);

    const money = (v?: number | null) => (typeof v === 'number' ? formatter.format(v) : '—');

    const handleAnalyze = async () => {
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const route = `${trip.startLocation} → ${trip.destinationName}, ${trip.startDate} a ${trip.endDate}`;
            setResult(await analyzeFare(fareText, trip.travelers, route));
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Falha ao analisar a tarifa.');
        } finally {
            setIsLoading(false);
        }
    };

    const tooShort = fareText.trim().length < 20;

    return (
        <div className="p-4 bg-white rounded-lg border border-teal-200 space-y-4 no-print">
            <div>
                <h4 className="font-bold text-lg text-teal-700">Analisar uma tarifa real</h4>
                <p className="text-sm text-gray-600 mt-1">
                    Achou uma passagem? Copie do site o preço, a família tarifária (ex.: Light, Plus), a bagagem incluída e as
                    regras de alteração/cancelamento, e cole aqui. A análise mostra o custo total provável, as taxas evitáveis
                    e quanto você perde se precisar mudar os planos.
                </p>
            </div>

            <textarea
                value={fareText}
                onChange={(e) => setFareText(e.target.value.slice(0, MAX_CHARS))}
                rows={6}
                placeholder={'Ex.: LATAM — GRU → SSA, 10/12 a 17/12, 2 adultos. Tarifa Light R$ 1.480,00 total. Inclui bolsa de mão 10 kg. Bagagem despachada não inclusa. Remarcação: multa R$ 350 + diferença. Cancelamento: sem reembolso, só taxas de embarque.'}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-gray-400">{fareText.length}/{MAX_CHARS}</span>
                <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={isLoading || tooShort}
                    className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Analisando…' : 'Analisar tarifa'}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm" role="alert">{error}</div>
            )}

            {result && (
                <div className="space-y-5 pt-4 border-t border-gray-200 text-sm text-gray-700">
                    <p className="text-gray-800">{result.resumoTarifa}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 rounded-lg border">
                            <p className="text-xs text-gray-500">Preço anunciado</p>
                            <p className="text-xl font-bold text-gray-800">{money(result.precoAnunciado)}</p>
                        </div>
                        <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                            <p className="text-xs text-gray-500">Custo total provável</p>
                            <p className="text-xl font-bold text-teal-700">{money(result.custoTotalProvavel)}</p>
                            {result.custoTotalProvavel == null && (
                                <p className="text-xs text-gray-500 mt-1">Faltam valores no texto para calcular.</p>
                            )}
                        </div>
                    </div>

                    <div className="p-3 bg-teal-50 border-l-4 border-teal-500 rounded">
                        <p className="font-semibold text-teal-800">Recomendação</p>
                        <p className="mt-1">{result.recomendacao}</p>
                    </div>

                    {result.alertas.length > 0 && (
                        <div>
                            <h5 className="font-semibold text-gray-800 mb-1">Atenção</h5>
                            <ul className="list-disc pl-5 space-y-1 text-amber-800">
                                {result.alertas.map((a, i) => <li key={i}>{a}</li>)}
                            </ul>
                        </div>
                    )}

                    {result.inclusos.length > 0 && (
                        <div>
                            <h5 className="font-semibold text-gray-800 mb-1">Incluso na tarifa</h5>
                            <ul className="list-disc pl-5 space-y-1">
                                {result.inclusos.map((a, i) => <li key={i}>{a}</li>)}
                            </ul>
                        </div>
                    )}

                    {result.cobrancasAdicionais.length > 0 && (
                        <div>
                            <h5 className="font-semibold text-gray-800 mb-2">Cobranças possíveis</h5>
                            <ul className="space-y-2">
                                {result.cobrancasAdicionais.map((c, i) => (
                                    <li key={i} className="p-2 bg-gray-50 rounded border">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span className="font-medium text-gray-800">{c.item}</span>
                                            <span className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TIPO_LABEL[c.tipo]?.cls ?? ''}`}>
                                                    {TIPO_LABEL[c.tipo]?.label ?? c.tipo}
                                                </span>
                                                <span className="font-semibold">
                                                    {typeof c.valor === 'number' ? money(c.valor) : 'valor não informado'}
                                                    {typeof c.valor === 'number' && !c.valorConstaNoTexto && ' (estimado)'}
                                                </span>
                                            </span>
                                        </div>
                                        {c.comoEvitar && <p className="text-xs text-gray-600 mt-1">{c.comoEvitar}</p>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div>
                        <h5 className="font-semibold text-gray-800 mb-1">Regras da tarifa</h5>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {([
                                ['Remarcação', result.regras.remarcacao],
                                ['Cancelamento', result.regras.cancelamento],
                                ['Reembolso', result.regras.reembolso],
                                ['No-show', result.regras.noShow],
                            ] as const).map(([k, v]) => (
                                <div key={k} className="p-2 bg-gray-50 rounded border">
                                    <dt className="text-xs text-gray-500">{k}</dt>
                                    <dd>{v}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    {result.cenariosDePrejuizo.length > 0 && (
                        <div>
                            <h5 className="font-semibold text-gray-800 mb-1">Se algo der errado</h5>
                            <ul className="space-y-1">
                                {result.cenariosDePrejuizo.map((c, i) => (
                                    <li key={i}>
                                        <span className="font-medium">{c.cenario}</span>
                                        {typeof c.perdaEstimada === 'number' && <span className="text-red-700 font-semibold"> — perda de ~{money(c.perdaEstimada)}</span>}
                                        <span className="text-gray-600">: {c.explicacao}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {result.informacoesFaltantes.length > 0 && (
                        <div>
                            <h5 className="font-semibold text-gray-800 mb-1">Confira no site antes de comprar</h5>
                            <ul className="list-disc pl-5 space-y-1 text-gray-600">
                                {result.informacoesFaltantes.map((a, i) => <li key={i}>{a}</li>)}
                            </ul>
                        </div>
                    )}

                    <p className="text-xs text-gray-400 italic">
                        Análise feita por IA a partir só do texto colado. Regras citadas da ANAC podem ter mudado; confirme no site da companhia antes de comprar.
                    </p>
                </div>
            )}
        </div>
    );
};
