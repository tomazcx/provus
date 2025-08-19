export const recoverPasswordTemplate = (url: string) => `
<mjml>
  <mj-body background-color="#fff">
    <mj-section>
      <mj-column>
        <mj-divider border-color="#555"></mj-divider>
        <mj-text font-size="20px" color="#555" font-family="helvetica">Provus - Recuperação de Senha</mj-text>
        <mj-text font-size="16px" color="#555">Recebemos uma solicitação para recuperar a senha da conta associada a esse email.</mj-text>
        <mj-text font-size="16px" color="#555">Redefina sua senha clicando no botão abaixo:</mj-text>
        <mj-button padding="50px 0px" href="${url}">Redefinir Senha</mj-button>
        <mj-divider border-color="#555" border-width="2px" />
        <mj-text font-size="14px" color="#555">O link para redefinir senha expirará em 24 horas.</mj-text>
        <mj-text font-size="14px" color="#555">Se você não solicitou a recuperação de senha, pode ignorar este email.</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`;
