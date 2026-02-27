import React from 'react';
import ErrorModal from './ErrorModal';
import { logError } from '../../services/errorApi';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: any;
  errorInfo: any;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: any) {
    // Actualiza el estado para que el siguiente renderizado muestre la UI de fallback.
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // Guarda la información del error y el stack de componentes
    this.setState({ errorInfo });

    // También puedes registrar el error en un servicio de reporte de errores
    console.error("Error capturado por ErrorBoundary:", error, errorInfo);
    logError(error, { componentStack: errorInfo.componentStack });
  }

  handleClose = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Opcionalmente, puedes recargar la página o redirigir al usuario
    // window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Solo muestra el modal en desarrollo
      if (import.meta.env.DEV) {
        return <ErrorModal error={this.state.error} componentStack={this.state.errorInfo?.componentStack} onClose={this.handleClose} />;
      }
      // En producción, puedes mostrar un mensaje más amigable
      return <h1>Algo salió mal. Por favor, recarga la página.</h1>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;