import React from 'react';
import {
  Shield,
  Cloud,
  Code2,
  Brain,
  GraduationCap,
  Cpu,
  BookOpen,
  Terminal,
  Network,
  Folder,
  Layers,
  Sparkles,
  Database,
  Lock,
  Compass,
} from 'lucide-react';

interface CategoryIconProps {
  name?: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5' }) => {
  switch (name?.toLowerCase()) {
    case 'shield':
    case 'security':
    case 'cybersecurity':
      return <Shield className={className} />;
    case 'cloud':
    case 'aws':
    case 'devops':
      return <Cloud className={className} />;
    case 'code':
    case 'code2':
    case 'web':
    case 'programming':
      return <Code2 className={className} />;
    case 'brain':
    case 'dsa':
    case 'algorithms':
      return <Brain className={className} />;
    case 'graduationcap':
    case 'university':
    case 'school':
      return <GraduationCap className={className} />;
    case 'cpu':
    case 'ai':
    case 'machine learning':
      return <Cpu className={className} />;
    case 'network':
      return <Network className={className} />;
    case 'database':
      return <Database className={className} />;
    case 'lock':
      return <Lock className={className} />;
    case 'terminal':
      return <Terminal className={className} />;
    case 'book':
    case 'bookopen':
      return <BookOpen className={className} />;
    case 'layers':
      return <Layers className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'compass':
      return <Compass className={className} />;
    default:
      return <Folder className={className} />;
  }
};
