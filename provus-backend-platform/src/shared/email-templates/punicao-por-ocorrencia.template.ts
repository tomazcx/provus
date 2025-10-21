export interface PunicaoPorOcorrenciaTemplateData {
  nomeEstudante: string;
  tipoInfracao: string;
  nomeAvaliacao: string;
  dataHoraInfracao: string;
  quantidadeOcorrencias: number;
  urlPlataforma?: string;
}

export const punicaoPorOcorrenciaTemplate = (
  data: PunicaoPorOcorrenciaTemplateData,
) => `
<mjml>
  <mj-body background-color="#fff">
    <mj-section>
      <mj-column>
        <mj-divider border-color="#555"></mj-divider>
        <mj-text font-size="20px" color="#555" font-family="helvetica">Provus - Notificação de Infração</mj-text>
        <mj-text font-size="16px" color="#555">Uma infração foi detectada durante a realização de uma avaliação.</mj-text>
        
        <mj-divider border-color="#e0e0e0" border-width="1px" />
        
        <mj-text font-size="16px" color="#333" font-weight="bold">Detalhes da Infração:</mj-text>
        
        <mj-text font-size="14px" color="#555">
          <strong>Estudante:</strong> ${data.nomeEstudante}
        </mj-text>
        
        <mj-text font-size="14px" color="#555">
          <strong>Avaliação:</strong> ${data.nomeAvaliacao}
        </mj-text>
        
        <mj-text font-size="14px" color="#555">
          <strong>Tipo de Infração:</strong> ${data.tipoInfracao}
        </mj-text>
        
        <mj-text font-size="14px" color="#555">
          <strong>Quantidade de Ocorrências:</strong> ${data.quantidadeOcorrencias}
        </mj-text>
        
        <mj-text font-size="14px" color="#555">
          <strong>Data e Hora:</strong> ${data.dataHoraInfracao}
        </mj-text>
        
        <mj-divider border-color="#e0e0e0" border-width="1px" />
        
        <mj-text font-size="14px" color="#666">
          Esta infração foi detectada automaticamente pelo sistema de monitoramento da plataforma Provus.
        </mj-text>
        
        ${
          data.urlPlataforma
            ? `
        <mj-button padding="20px 0px" href="${data.urlPlataforma}" background-color="#007bff" color="white">
          Acessar Plataforma
        </mj-button>
        `
            : ''
        }
        
        <mj-divider border-color="#555" border-width="2px" />
        
        <mj-text font-size="12px" color="#888">
          Este é um email automático. Por favor, não responda a esta mensagem.
        </mj-text>
        
        <mj-text font-size="12px" color="#888">
          Para mais informações, acesse a plataforma Provus.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;
