package com.demoapp.demo.controller;

import com.demoapp.demo.dto.UserDTO;
import com.demoapp.demo.model.User;
import com.demoapp.demo.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Testes da camada de autenticação.
// Aqui validamos apenas o comportamento das rotas sem acessar banco de dados.
@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    // Cria um DTO para ser enviado nas requisições.
    private UserDTO montarRequisicao(String email, String senha) {
        UserDTO dto = new UserDTO();
        dto.setEmail(email);
        dto.setPassword(senha);
        return dto;
    }

    // Cria um usuário simulado para os cenários de teste.
    private User montarUsuario(String email, String senha) {
        User u = new User();
        u.setEmail(email);
        u.setPassword(senha);
        return u;
    }

    @BeforeEach
    void limparEstado() {
        // Mantido apenas para organização futura caso novos mocks sejam adicionados.
    }

    @Test
    @DisplayName("POST /auth/signup com dados válidos deve retornar 200 e o e-mail do usuário")
    void deveRetornar200AoCadastrarComDadosCorretos() throws Exception {

        String emailTeste = "renan@exemplo.com";
        String senhaTeste = "Renan@2024";

        User novoUsuario = montarUsuario(emailTeste, senhaTeste);
        novoUsuario.setId(1L);

        // Simula todas as validações passando com sucesso.
        when(userService.isEmailValid(emailTeste)).thenReturn(true);
        when(userService.isPasswordValid(senhaTeste)).thenReturn(true);
        when(userService.findByEmail(emailTeste)).thenReturn(null);
        when(userService.createUser(emailTeste, senhaTeste)).thenReturn(novoUsuario);

        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                montarRequisicao(emailTeste, senhaTeste))))
                // Cadastro deve ser concluído com sucesso.
                .andExpect(status().isOk())

                // Confirma se o e-mail retornado é o esperado.
                .andExpect(jsonPath("$.email").value(emailTeste));
    }

    @Test
    @DisplayName("POST /auth/signin com senha incorreta deve retornar 401 e 'Credenciais inválidas'")
    void deveRetornar401ParaLoginComSenhaErrada() throws Exception {

        String email = "renan@exemplo.com";
        String senhaCorreta = "Renan@2024";
        String senhaErrada = "SenhaErrada@99";

        User usuarioNoBanco = montarUsuario(email, senhaCorreta);

        // Usuário existe, mas a senha enviada é diferente da cadastrada.
        when(userService.isEmailValid(email)).thenReturn(true);
        when(userService.isPasswordValid(senhaErrada)).thenReturn(true);
        when(userService.findByEmail(email)).thenReturn(usuarioNoBanco);

        mockMvc.perform(post("/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                montarRequisicao(email, senhaErrada))))
                // Login deve ser recusado.
                .andExpect(status().isUnauthorized())

                // Mensagem exibida ao usuário.
                .andExpect(jsonPath("$.message").value("Credenciais inválidas"));
    }

    /*
     * Bug encontrado durante a validação dos requisitos.
     *
     * O comportamento esperado é retornar:
     * "E-mail já cadastrado"
     *
     * Porém a implementação atual responde:
     * "E-mail já está em uso"
     *
     * O teste permanece falhando para documentar a divergência.
     */
    @Test
    @DisplayName("[BUG] POST /auth/signup com e-mail duplicado deve retornar 'E-mail já cadastrado'")
    void deveMostrarMensagemCorretaParaEmailJaExistente() throws Exception {

        String emailExistente = "renan@exemplo.com";
        String senha = "Renan@2024";

        // Simula um usuário já cadastrado na base.
        when(userService.isEmailValid(emailExistente)).thenReturn(true);
        when(userService.isPasswordValid(senha)).thenReturn(true);
        when(userService.findByEmail(emailExistente))
                .thenReturn(montarUsuario(emailExistente, senha));

        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                montarRequisicao(emailExistente, senha))))
                // Cadastro duplicado deve retornar conflito.
                .andExpect(status().isConflict())

                // Mensagem exigida pelo requisito.
                .andExpect(jsonPath("$.message").value("E-mail já cadastrado"));
    }
}