import { useEffect, useRef, useState, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { X, ScanLine, Flashlight, Camera } from 'lucide-react'

interface BarcodeScannerProps {
  onScan: (codigo: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<<Html5Qrcode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [torchOn, setTorchOn] = useState(false)
  const [escaneado, setEscaneado] = useState(false)
  const containerRef = useRef<<HTMLDivElement>(null)
  const scannerIdRef = useRef<string>('')

  const detenerScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const estado = scannerRef.current.getState()
        if (estado === 2) { // 2 = SCANNING
          await scannerRef.current.stop()
        }
      } catch (e) {
        // Ya estaba detenido
      }
      try {
        scannerRef.current.clear()
      } catch (e) {
        // Ya estaba limpio
      }
      scannerRef.current = null
    }
    
    // Limpiar el div del scanner
    const div = document.getElementById(scannerIdRef.current)
    if (div && div.parentNode) {
      div.parentNode.removeChild(div)
    }
  }, [])

  useEffect(() => {
    const scannerId = 'scanner-' + Date.now()
    scannerIdRef.current = scannerId
    
    const scannerDiv = document.createElement('div')
    scannerDiv.id = scannerId
    scannerDiv.style.width = '100%'
    scannerDiv.style.height = '100%'
    if (containerRef.current) {
      containerRef.current.appendChild(scannerDiv)
    }

    const startScanner = async () => {
      try {
        scannerRef.current = new Html5Qrcode(scannerId)
        
        await scannerRef.current.start(
          { facingMode: 'environment' },
          {
            fps: 15,
            qrbox: { width: 280, height: 180 },
            aspectRatio: 1.0,
            disableFlip: false
          },
          (decodedText) => {
            if (escaneado) return
            setEscaneado(true)
            
            // Beep de confirmacion (opcional)
            try {
              const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE')
              audio.play().catch(() => {})
            } catch(e) {}
            
            // Detener y notificar
            detenerScanner().then(() => {
              onScan(decodedText)
            })
          },
          () => {
            // Errores de escaneo normales - ignorar
          }
        )
      } catch (err: any) {
        console.error('Error scanner:', err)
        setError('No se pudo acceder a la camara. Verifica que hayas dado permiso.')
      }
    }

    startScanner()

    return () => {
      detenerScanner()
    }
  }, [onScan, detenerScanner, escaneado])

  const toggleTorch = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      const track = stream.getVideoTracks()[0]
      const capabilities = track.getCapabilities() as any
      
      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: !torchOn }]
        } as any)
        setTorchOn(!torchOn)
      } else {
        alert('Linterna no disponible en este dispositivo')
      }
    } catch (e) {
      console.log('Linterna no disponible')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
              <ScanLine className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Escanear Codigo</h2>
              <p className="text-gray-400 text-sm">Apunta la camara al codigo de barras</p>
            </div>
          </div>
          <button onClick={() => { detenerScanner(); onClose(); }} className="p-2 text-white hover:bg-white/10 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Area de escaneo */}
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] border-2 border-green-500/50">
          <div ref={containerRef} className="w-full h-full" />
          
          {/* Overlay guia */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-72 h-44 relative">
              {/* Esquinas */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg" />
              
              {/* Linea laser */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-green-400/80 shadow-[0_0_10px_rgba(74,222,128,0.8)] animate-[scan_2s_linear_infinite]" />
              
              {/* Texto */}
              <div className="absolute -bottom-8 left-0 right-0 text-center">
                <span className="text-green-400 text-xs font-medium bg-black/50 px-2 py-1 rounded">
                  Centra el codigo de barras
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="flex justify-center gap-3 mt-6">
          <button onClick={toggleTorch} className="px-4 py-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 flex items-center gap-2 transition-all">
            <Flashlight className="w-5 h-5" />
            <span className="text-sm font-medium">{torchOn ? 'Apagar' : 'Linterna'}</span>
          </button>
          <button onClick={() => { detenerScanner(); onClose(); }} className="px-4 py-2.5 bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/30 flex items-center gap-2 transition-all">
            <X className="w-5 h-5" />
            <span className="text-sm font-medium">Cancelar</span>
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-center text-sm">
            <Camera className="w-6 h-6 mx-auto mb-2" />
            {error}
            <p className="mt-2 text-xs text-red-300">
              Tip: Usa Chrome en Android o Safari en iPhone. Asegurate de dar permiso de camara.
            </p>
          </div>
        )}

        <p className="text-center text-gray-600 text-xs mt-6">
          Tambien puedes escribir el codigo manualmente en la barra de busqueda
        </p>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  )
}