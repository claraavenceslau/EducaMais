import { describe, expect, it, jest } from '@jest/globals';
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
jest.setTimeout(40000);
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';

jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItem: async (k: string) => store.get(k) ?? null,
      setItem: async (k: string, v: string) => { store.set(k, v); },
      removeItem: async (k: string) => { store.delete(k); },
    },
  };
});
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { Ionicons: () => null, __esModule: true, Text };
});
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

import { AuthProvider, useAuth } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';
import { MainNavigator } from '../navigation/MainNavigator';
import { STUDENT, TEACHER } from '../testing/helpers';
import type { User } from '../types';

function Gate({ user }: { user: User }) {
  const { user: u, startSession } = useAuth();
  React.useEffect(() => { startSession(user); }, [startSession, user]);
  if (!u) return null;
  return (
    <NavigationContainer>
      <DataProvider user={u}><MainNavigator /></DataProvider>
    </NavigationContainer>
  );
}

const app = async (user: User) => render(<AuthProvider><Gate user={user} /></AuthProvider>);
const T = { timeout: 15000 };

describe('fumaça: o app abre e navega', () => {
  it('aluno: Início, aba Escola, Demandas e detalhe', async () => {
    await app(STUDENT);
    await screen.findByText('Vamos estudar?', {}, T);
    await fireEvent.press(screen.getByText('Escola'));
    await fireEvent.press(await screen.findByText('Demandas', {}, T));
    await fireEvent.press(await screen.findByText(/Lâmpadas queimadas/, {}, T));
    await screen.findByText('Acompanhamento', {}, T);
  });

  it('aluno: nova demanda valida campos e envia', async () => {
    await app(STUDENT);
    await screen.findByText('Vamos estudar?', {}, T);
    await fireEvent.press(screen.getByText('Escola'));
    await fireEvent.press(await screen.findByText('Demandas', {}, T));
    await screen.findByText(/Lâmpadas queimadas/, {}, T);
    await fireEvent.press(await screen.findByLabelText('Nova demanda', {}, T));
    await fireEvent.press(await screen.findByText('Enviar demanda', {}, T));
    await screen.findByText('Informe um título para a demanda.', {}, T);
    await fireEvent.changeText(screen.getByLabelText('Título'), 'Torneira quebrada no pátio');
    await fireEvent.changeText(screen.getByLabelText('Descrição'), 'A torneira do pátio está vazando água o dia todo.');
    await fireEvent.press(screen.getByText('Enviar demanda'));
    await screen.findByText('Torneira quebrada no pátio', {}, T);
    expect(screen.getByText(/Protocolo 2026-0009/)).toBeTruthy();
  });

  it('aluno: avisos abrem', async () => {
    await app(STUDENT);
    await screen.findByText('Vamos estudar?', {}, T);
    await fireEvent.press(screen.getByText('Escola'));
    await fireEvent.press(await screen.findByText('Avisos', {}, T));
    await screen.findByText('Aulas suspensas na sexta-feira', {}, T);
  });

  it('aluno: agendamento e informações abrem', async () => {
    await app(STUDENT);
    await screen.findByText('Vamos estudar?', {}, T);
    await fireEvent.press(screen.getByText('Escola'));
    await fireEvent.press(await screen.findByText('Agendamentos', {}, T));
    await screen.findByText('Nenhum atendimento marcado', {}, T);
    await fireEvent.press(screen.getByLabelText('Agendar atendimento'));
    await screen.findByText('1. Tipo de atendimento', {}, T);
  });

  it('aluno: detalhe do curso mostra avaliações', async () => {
    await app(STUDENT);
    await screen.findByText('Vamos estudar?', {}, T);
    await fireEvent.press(screen.getByText('Cursos'));
    const buttons = await screen.findAllByText('Ver curso', {}, T);
    await fireEvent.press(buttons[0]);
    await screen.findByText('Avaliações', {}, T);
    expect(screen.getByText('Avalie este curso')).toBeTruthy();
  });

  it('professor: painel mostra números e avaliações', async () => {
    await app(TEACHER);
    await screen.findByText('Painel do Professor', {}, T);
    await screen.findByText('56', {}, T);
    expect(screen.getByText('Avaliações dos alunos')).toBeTruthy();
    await fireEvent.press(screen.getByText('Cursos'));
    const links = await screen.findAllByText('Ver avaliações', {}, T);
    expect(links.length).toBeGreaterThan(0);
  });

  it('perfil: editar perfil abre', async () => {
    await app(STUDENT);
    await screen.findByText('Vamos estudar?', {}, T);
    await fireEvent.press(screen.getByText('Perfil'));
    await fireEvent.press(await screen.findByText('Editar perfil', {}, T));
    await screen.findByText('Nome completo', {}, T);
  });
});
