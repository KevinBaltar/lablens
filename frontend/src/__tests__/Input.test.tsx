import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Input from '../components/ui/Input'

describe('Input Component', () => {
  it('deve renderizar o input com label', () => {
    render(<Input label="Email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('deve renderizar o input com placeholder', () => {
    render(<Input placeholder="Digite seu email" />)
    expect(screen.getByPlaceholderText('Digite seu email')).toBeInTheDocument()
  })

  it('deve chamar onChange quando o valor muda', () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} />)
    
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'teste' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('deve mostrar mensagem de erro', () => {
    render(<Input error="Campo obrigatório" />)
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument()
  })

  it('deve aplicar classe de erro no input', () => {
    render(<Input error="Erro" />)
    const input = screen.getByRole('textbox')
    expect(input.className).toContain('border-red-500')
  })

  it('deve estar desabilitado quando disabled', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('deve ter tipo password quando especificado', () => {
    render(<Input type="password" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'password')
  })
})
