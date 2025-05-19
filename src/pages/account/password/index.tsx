import { useEffect } from 'react';
import { useRouter } from 'next/router';
import PasswordChangePage from '../password';

export default function PasswordPage() {
  const router = useRouter();
  
  // This component simply renders the PasswordChangePage component
  // to handle the /account/password/ path (with trailing slash)
  return <PasswordChangePage />;
} 