import { useState } from 'react'
import { Delete, Check, X } from 'lucide-react'

interface TecladoNumericoProps {
  visible: boolean
  titulo: string
  onConfirmar: (valor: number) => void
  onCancelar: () => void
  valorInicial?: number
}

export default function TecladoNumerico({ visible, titulo, onConfirmar, onCancelar, valorInicial = 0 }: TecladoNumericoProps) {
  const [display, setDisplay] = useState(valorInicial.toString())

  if (!visible) return null

  const agregarDigito = (digito: string) => {
    if (display === '0' && digito !== '.') {
      setDisplay(digito)
    } else {
      setDisplay(prev => prev + digito)
    }
  }

  const borrar = () => {
    setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0')
  }

  const limpiar = () => {
    setDisplay('0')
  }

  const confirmar = () => {
    const valor = parseFloat(display)
    if (valor > 0) {
      onConfirmar(valor)
      setDisplay('0')
    }
  }

  const teclas = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', '⌫']
  ]

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center">
      <div className="bg-white w-full max-w-md rounded-t-3xl p-4 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-gray-800">{titulo}</h3>
          <button onClick={onCancelar} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Display */}
        <div className="bg-gray-100 rounded-xl p-4 mb-4 text-right">
          <span className="text-3xl font-bold text-gray-800">${display}</span>
        </div>

        {/* Teclado */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {teclas.flat().map((tecla) => (
            <button
              key={tecla}
              onClick={() => {
                if (tecla === '⌫') borrar()
                else if (tecla === '.') {
                  if (!display.includes('.')) agregarDigito('.')
                } else {
                  agregarDigito(tecla)
                }
              }}
              className={`h-16 rounded-xl font-bold text-xl transition-all active:scale-95 ${
                tecla === '⌫'
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {tecla === '⌫' ? <Delete className="w-6 h-6 mx-auto" /> : tecla}
            </button>
          ))}
        </div>

        {/* Acciones */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={limpiar} className="btn-outline h-14 text-lg">
            Limpiar
          </button>
          <button onClick={confirmar} className="btn-success h-14 text-lg">
            <Check className="w-5 h-5" />
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
