export const submissaoCriadaTemplate = (url: string, nomeProva?: string) => `
<mjml>
  <mj-body background-color="#fff">
    <mj-section>
      <mj-column>
        <mj-divider border-color="#555"></mj-divider>
        <mj-text font-size="20px" color="#555" font-family="helvetica">Provus - Avaliação Iniciada</mj-text>
        <mj-text font-size="16px" color="#555">Sua avaliação ${nomeProva ? ` "${nomeProva}"` : ''} foi iniciada com sucesso!</mj-text>
        <mj-text font-size="16px" color="#555">⚠️ <strong>IMPORTANTE:</strong> Se você sair da prova ou fechar o navegador, a única forma de retornar e continuar respondendo é através do link abaixo.</mj-text>
        <mj-text font-size="16px" color="#555">Guarde este email com cuidado e acesse sua avaliação clicando no botão:</mj-text>
        <mj-button padding="50px 0px" href="${url}" background-color="#007bff" color="#ffffff">Acessar Minha Avaliação</mj-button>
        <mj-divider border-color="#555" border-width="2px" /> 
        <mj-text font-size="14px" color="#555">Boa sorte em sua avaliação!</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`;
