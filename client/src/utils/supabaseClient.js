import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Mock database store using localStorage
const getMockTableData = (table) => {
  const data = localStorage.getItem(`herverse-mock-db-${table}`);
  return data ? JSON.parse(data) : [];
};

const saveMockTableData = (table, data) => {
  localStorage.setItem(`herverse-mock-db-${table}`, JSON.stringify(data));
};

// Initialize mock users if not present
const getMockUsers = () => {
  const users = localStorage.getItem('herverse-mock-users');
  if (!users) {
    const initialUsers = [
      { id: 'usr-default-123', email: 'test@example.com', password: 'password123', name: 'Jane Doe', isAdmin: false },
      { id: 'usr-admin-789', email: 'admin@example.com', password: 'admin123', name: 'Admin Manager', isAdmin: true }
    ];
    localStorage.setItem('herverse-mock-users', JSON.stringify(initialUsers));
    return initialUsers;
  }
  return JSON.parse(users);
};

// Mock Supabase Client implementation
class MockSupabaseClient {
  constructor() {
    this.auth = {
      signUp: async ({ email, password, options }) => {
        console.log('[MockSupabase] signUp called for:', email);
        const users = getMockUsers();
        const exists = users.some(u => u.email === email);
        if (exists) {
          return { data: null, error: { message: 'User already exists' } };
        }
        
        const name = options?.data?.name || 'New User';
        const isAdmin = email === 'admin@example.com' || !!options?.data?.isAdmin;
        const newUser = {
          id: 'usr-' + Math.random().toString(36).substr(2, 9),
          email,
          password,
          name,
          isAdmin
        };
        
        users.push(newUser);
        localStorage.setItem('herverse-mock-users', JSON.stringify(users));
        
        return {
          data: {
            user: { id: newUser.id, email, user_metadata: { name, isAdmin } },
            session: { access_token: 'mock-token-' + newUser.id, user: { id: newUser.id, email } }
          },
          error: null
        };
      },

      signInWithPassword: async ({ email, password }) => {
        console.log('[MockSupabase] signInWithPassword called for:', email);
        const users = getMockUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
          return { data: { session: null, user: null }, error: { message: 'Invalid login credentials' } };
        }
        
        const session = {
          access_token: 'mock-token-' + user.id,
          user: { id: user.id, email, user_metadata: { name: user.name, isAdmin: user.isAdmin } }
        };
        
        localStorage.setItem('herverse-mock-session', JSON.stringify(session));
        return { data: { session, user: session.user }, error: null };
      },

      signOut: async () => {
        console.log('[MockSupabase] signOut called');
        localStorage.removeItem('herverse-mock-session');
        return { error: null };
      },

      getSession: async () => {
        const saved = localStorage.getItem('herverse-mock-session');
        return { data: { session: saved ? JSON.parse(saved) : null }, error: null };
      },

      getUser: async () => {
        const saved = localStorage.getItem('herverse-mock-session');
        if (saved) {
          const session = JSON.parse(saved);
          return { data: { user: session.user }, error: null };
        }
        return { data: { user: null }, error: null };
      },

      onAuthStateChange: (callback) => {
        // Mock subscription trigger
        const saved = localStorage.getItem('herverse-mock-session');
        const session = saved ? JSON.parse(saved) : null;
        callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
    };
  }

  // Chainable mock queries
  from(table) {
    console.log('[MockSupabase] Query builder invoked for table:', table);
    return {
      select: (fields) => {
        const data = getMockTableData(table);
        return {
          eq: (column, value) => {
            const filtered = data.filter(item => item[column] === value);
            return Promise.resolve({ data: filtered, error: null });
          },
          order: (column, { ascending = true } = {}) => {
            const sorted = [...data].sort((a, b) => {
              if (a[column] < b[column]) return ascending ? -1 : 1;
              if (a[column] > b[column]) return ascending ? 1 : -1;
              return 0;
            });
            return Promise.resolve({ data: sorted, error: null });
          },
          then: (resolve) => {
            resolve({ data, error: null });
          }
        };
      },

      insert: (rows) => {
        const data = getMockTableData(table);
        const toAdd = Array.isArray(rows) ? rows : [rows];
        const added = toAdd.map(row => ({
          id: 'row-' + Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString(),
          ...row
        }));
        
        saveMockTableData(table, [...data, ...added]);
        return Promise.resolve({ data: added, error: null });
      },

      update: (values) => {
        return {
          eq: (column, value) => {
            const data = getMockTableData(table);
            const updated = data.map(item => {
              if (item[column] === value) {
                return { ...item, ...values, updated_at: new Date().toISOString() };
              }
              return item;
            });
            saveMockTableData(table, updated);
            return Promise.resolve({ data: updated, error: null });
          }
        };
      },

      delete: () => {
        return {
          eq: (column, value) => {
            const data = getMockTableData(table);
            const filtered = data.filter(item => item[column] !== value);
            saveMockTableData(table, filtered);
            return Promise.resolve({ data: filtered, error: null });
          }
        };
      }
    };
  }
}

// Export client dynamically based on environment configuration
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new MockSupabaseClient();

console.log((supabaseUrl && supabaseAnonKey)
  ? '[Supabase] Connected to live cloud DB instance.'
  : '[Supabase] Credentials missing. Running inside local MockSupabase environment.'
);
