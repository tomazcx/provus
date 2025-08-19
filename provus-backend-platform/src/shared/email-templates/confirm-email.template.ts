export const confirmEmailTemplate = (url: string) => `
<mjml>
  <mj-body background-color="#fff">
    <mj-section>
      <mj-column>
        <mj-divider border-color="#555"></mj-divider>
        <mj-text font-size="20px" color="#555" font-family="helvetica">Provus - Confirmação de Email</mj-text>
        <mj-text font-size="16px" color="#555">Obrigado por se registrar no Provus. </mj-text>
        <mj-text font-size="16px" color="#555">Para finalizar o processo de registro e começar a usar o sistema, por favor, confirme seu email clicando no botão abaixo:</mj-text>
        <mj-button padding="50px 0px" href="${url}">Confirmar Email</mj-button>
        <mj-divider border-color="#555" border-width="2px" />
        <mj-text font-size="14px" color="#555">O link para confirmar email expirará em 24 horas.</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`;
