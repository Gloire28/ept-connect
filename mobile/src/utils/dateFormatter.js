// mobile/src/utils/dateFormatter.js
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDate = (dateString, pattern = 'dd MMMM yyyy') => {
  if (!dateString) return '';
  try {
    return format(parseISO(dateString), pattern, { locale: fr });
  } catch {
    return dateString;
  }
};

export const formatShortDate = (dateString) => formatDate(dateString, 'dd/MM/yyyy');
export const formatRelativeTime = (dateString) => {
  // À étendre plus tard avec date-fns distanceToNow si besoin
  return formatDate(dateString, 'dd MMM yyyy');
};