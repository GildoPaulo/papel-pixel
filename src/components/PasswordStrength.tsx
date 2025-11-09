import { getPasswordStrengthColor, getPasswordStrengthLabel } from '@/utils/passwordValidation';
import { Badge } from './ui/badge';

interface PasswordStrengthProps {
  strength: 'weak' | 'medium' | 'strong';
  showLabel?: boolean;
}

export function PasswordStrength({ strength, showLabel = true }: PasswordStrengthProps) {
  const color = getPasswordStrengthColor(strength);
  const label = getPasswordStrengthLabel(strength);

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-300`}
          style={{ 
            width: strength === 'weak' ? '33%' : strength === 'medium' ? '66%' : '100%' 
          }}
        />
      </div>
      {showLabel && (
        <Badge variant={strength === 'strong' ? 'default' : 'secondary'} className="text-xs">
          {label}
        </Badge>
      )}
    </div>
  );
}



