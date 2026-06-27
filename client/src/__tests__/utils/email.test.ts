import { isEmailValid, getEmailValidationMessage } from '@/utils/email';

// Testes das funções responsáveis por validar e-mails
// e retornar mensagens de erro para o usuário.
describe('Validação de e-mail — isEmailValid', () => {
  describe('casos válidos', () => {
    it('aceita um e-mail com formato correto', () => {
      const resultado = isEmailValid('renan@gmail.com');

      // Caso mais comum de uso.
      expect(resultado).toBeTruthy();
    });

    it('aceita e-mail com ponto no nome de usuário', () => {
      const resultado = isEmailValid('renan.silva@outlook.com');

      // Muitos usuários utilizam ponto no endereço.
      expect(resultado).toBeTruthy();
    });

    it('aceita e-mail com subdomínio', () => {
      const resultado = isEmailValid('contato@mail.empresa.com.br');

      // Garante compatibilidade com domínios corporativos.
      expect(resultado).toBeTruthy();
    });
  });

  describe('casos inválidos', () => {
    it('rejeita entrada vazia', () => {
      // Campo vazio nunca deve ser considerado válido.
      expect(isEmailValid('')).toBe(false);
    });

    it('rejeita e-mail sem o símbolo @', () => {
      // Falta do @ torna o endereço inválido.
      expect(isEmailValid('renan.semArroba.com')).toBe(false);
    });

    it('rejeita e-mail sem domínio depois do @', () => {
      // Existe o @ mas não existe domínio.
      expect(isEmailValid('renan@')).toBe(false);
    });

    it('rejeita e-mail sem extensão de domínio (.com, .br etc)', () => {
      // Domínio incompleto.
      expect(isEmailValid('renan@dominio')).toBe(false);
    });
  });
});

describe('Mensagens de erro — getEmailValidationMessage', () => {
  it('retorna mensagem de campo obrigatório quando e-mail está vazio', () => {
    const msg = getEmailValidationMessage('');

    // Deve orientar o usuário a preencher o campo.
    expect(msg).toBe('Email é obrigatório');
  });

  it('retorna mensagem de formato inválido para e-mail malformado', () => {
    const msg = getEmailValidationMessage('isso-nao-e-email');

    // Deve informar que o formato digitado não é válido.
    expect(msg).toBe('Email inválido');
  });

  it('não retorna nenhuma mensagem quando o e-mail é válido', () => {
    const msg = getEmailValidationMessage('renan@teste.com');

    // Sem erros, sem mensagem.
    expect(msg).toBe('');
  });
});