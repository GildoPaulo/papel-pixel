// Validação de senha forte
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  if (!checks.length) errors.push('Mínimo 8 caracteres');
  if (!checks.uppercase) errors.push('Pelo menos 1 letra maiúscula');
  if (!checks.lowercase) errors.push('Pelo menos 1 letra minúscula');
  if (!checks.number) errors.push('Pelo menos 1 número');
  if (!checks.special) errors.push('Pelo menos 1 caractere especial');

  const passedChecks = Object.values(checks).filter(Boolean).length;
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  
  if (passedChecks >= 4) strength = 'medium';
  if (passedChecks === 5) strength = 'strong';

  return {
    isValid: errors.length === 0,
    errors,
    strength
  };
}

export function getPasswordStrengthColor(strength: string): string {
  switch (strength) {
    case 'weak': return 'bg-red-500';
    case 'medium': return 'bg-yellow-500';
    case 'strong': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
}

export function getPasswordStrengthLabel(strength: string): string {
  switch (strength) {
    case 'weak': return 'Fraca';
    case 'medium': return 'Média';
    case 'strong': return 'Forte';
    default: return 'Insuficiente';
  }
}



