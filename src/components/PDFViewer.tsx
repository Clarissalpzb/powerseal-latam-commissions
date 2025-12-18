import { useState, useEffect } from 'react';
import { getFileUrl, cleanupFileUrl } from '@/utils/fileUtils';

interface PDFViewerProps {
  isOpen: boolean;
  onClose: () => void;
  pdfPath: string;
  title?: string;
}

const PDFViewer = ({ isOpen, onClose, pdfPath, title = 'Document PDF' }: PDFViewerProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fileUrl, setFileUrl] = useState<string>('');

  useEffect(() => {
    if (isOpen && pdfPath) {
      const url = getFileUrl(pdfPath);
      setFileUrl(url);
      setLoading(true);
      setError(false);
    }

    return () => {
      if (fileUrl && fileUrl.startsWith('blob:')) {
        cleanupFileUrl(fileUrl);
      }
    };
  }, [isOpen, pdfPath]);

  if (!isOpen) return null;

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-75">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{pdfPath.split('/').pop()}</p>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href={fileUrl}
              download={pdfPath.split('/').pop()}
              className="btn-secondary text-sm"
              title="Descargar PDF"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Descargar
            </a>
            <button
              onClick={() => window.open(fileUrl, '_blank')}
              className="btn-secondary text-sm"
              title="Abrir en nueva ventana"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Abrir
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Cerrar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 bg-gray-100">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg className="animate-spin w-8 h-8 text-primary-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-600">Cargando PDF...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se puede cargar el PDF</h3>
                <p className="text-sm text-gray-500 mb-4">
                  El archivo PDF no está disponible o no se puede mostrar en el navegador.
                </p>
                <div className="space-x-3">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-sm"
                  >
                    Abrir en Nueva Ventana
                  </a>
                  <a
                    href={fileUrl}
                    download={pdfPath.split('/').pop()}
                    className="btn-secondary text-sm"
                  >
                    Descargar Archivo
                  </a>
                </div>
              </div>
            </div>
          )}

          {!error && fileUrl && (
            <iframe
              src={fileUrl}
              className="w-full h-full border-0"
              onLoad={handleLoad}
              onError={handleError}
              title="PDF Viewer"
            />
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t px-6 py-3">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              Usa las herramientas del navegador para navegar por el PDF (zoom, scroll, etc.)
            </p>
            <button
              onClick={onClose}
              className="btn-secondary text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;