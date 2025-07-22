/**
 * 🎨 UI Components Index - Design System v2.0 avec Palette Editia
 * 
 * Exportation centralisée des composants UI génériques
 * Utilisant la palette Editia (#FF0050, #FFD700, #00FF88, #007AFF)
 */

export { default as Button } from './Button';
export { default as Card } from './Card';
export { default as Modal } from './Modal';
export { default as Input } from './Input';

// Types exports
export type { ButtonProps } from './Button';
export type { CardProps } from './Card';
export type { ModalProps } from './Modal';
export type { InputProps } from './Input';

/**
 * 🚀 USAGE RAPIDE:
 * 
 * import { Button, Card, Modal, Input } from '@/components/ui';
 * 
 * // Tous les composants utilisent automatiquement la palette Editia:
 * // - Rouge Editia (#FF0050) pour les actions principales
 * // - Or Premium (#FFD700) pour les fonctionnalités Pro
 * // - Vert Succès (#00FF88) pour les états de réussite
 * // - Bleu Accent (#007AFF) pour les actions secondaires
 */