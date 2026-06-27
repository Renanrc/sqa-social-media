import { isPasswordValid, getPasswordValidationMessage } from '@/utils/password';

// Testes das regras de validação de senha.
// Os cenários seguem os requisitos definidos pelo sistema.
describe('isPasswordValid — verificação das regras de senha', () => {
  it('valida corretamente uma senha que cumpre todos os critérios', () => {
    const senhaForte = 'Renan@2024';

    // Senha com maiúscula, minúscula, número e caractere especial.
    expect(isPasswordValid(senhaForte)).toBe(true);
  });

  it('rejeita senha que não possui letra maiúscula', () => {
    // Falta pelo menos uma letra maiúscula.
    expect(isPasswordValid('renan@2024')).toBe(false);
  });

  it('rejeita senha composta somente por maiúsculas e sem minúscula', () => {
    // Existe maiúscula, mas nenhuma letra minúscula.
    expect(isPasswordValid('RENAN@2024')).toBe(false);
  });

  it('rejeita senha sem nenhum número', () => {
    // A senha precisa conter pelo menos um número.
    expect(isPasswordValid('Renan@abcd')).toBe(false);
  });

  it('rejeita senha sem caractere especial', () => {
    // Falta um caractere especial como @, #, !, etc.
    expect(isPasswordValid('Renan12345')).toBe(false);
  });

  /*
   * Bug encontrado durante os testes
   *
   * Pelo requisito, uma senha com exatamente 8 caracteres
   * deveria ser aceita desde que cumpra as demais regras.
   *
   * Atualmente a validação está rejeitando esse cenário.
   * Este teste fica registrado para evidenciar o problema.
   */
  it('[BUG] deve aceitar senha com exatamente 8 caracteres válidos', () => {
    const senhaComOitoChars = 'Ra@12345';

    // Possui todos os requisitos exigidos.
    expect(isPasswordValid(senhaComOitoChars)).toBe(true);
  });
});

describe('getPasswordValidationMessage — mensagens de feedback', () => {
  it('informa que a senha é obrigatória quando o campo está vazio', () => {
    // Usuário não preencheu o campo.
    expect(getPasswordValidationMessage('')).toBe('Senha é obrigatória');
  });

  it('menciona o critério de comprimento mínimo para senhas curtas', () => {
    const mensagem = getPasswordValidationMessage('Rn@1');

    // Deve orientar sobre a quantidade mínima de caracteres.
    expect(mensagem).toContain('mínimo de 8 caracteres');
  });

  it('não retorna nenhuma mensagem de erro para senha válida', () => {
    // Senha atende todas as regras.
    expect(getPasswordValidationMessage('Renan@2024')).toBe('');
  });
});