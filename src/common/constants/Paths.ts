import jetPaths from 'jet-paths';

const Paths = {
  _: '/api',

  Auth: {
    _: '/auth',
    Register: '/register',
    Login: '/login',
    Refresh: '/refresh',
    ForgotPassword: '/forgot-password',
    ResetPassword: '/reset-password',
  },

  Users: {
    _: '/users',
    Get: '/all',
    Add: '/add',
    Update: '/update',
    Delete: '/delete/:id',
  },
} as const;

export const JetPaths = jetPaths(Paths);
export default Paths;