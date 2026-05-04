export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  items_count: number;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  items_count: number;
  total_stock: number;
  created_at: string;
  updated_at: string;
}

export interface ItemStock {
  id: number;
  item_id: number;
  location_id: number;
  quantity: number;
  location?: Location;
}

export interface Item {
  id: number;
  code: string;
  name: string;
  category?: Category;
  unit: string;
  image: string | null;
  minimum_stock: number;
  total_stock: number;
  status: "habis" | "hampir_habis" | "aman";
  stocks?: ItemStock[];
  created_at: string;
  updated_at: string;
}

export interface StockIn {
  id: number;
  item?: Item;
  location?: Location;
  quantity: number;
  supplier: string;
  date: string;
  note: string | null;
  user?: User;
  created_at: string;
}

export interface StockOut {
  id: number;
  item?: Item;
  location?: Location;
  quantity: number;
  purpose: string;
  date: string;
  note: string | null;
  user?: User;
  created_at: string;
}

export interface StockTransfer {
  id: number;
  item?: Item;
  from_location?: Location;
  to_location?: Location;
  quantity: number;
  note: string | null;
  user?: User;
  created_at: string;
}

export interface StockAdjustment {
  id: number;
  item?: Item;
  location?: Location;
  type: string;
  quantity: number;
  old_quantity: number;
  new_quantity: number;
  reason: string;
  note: string | null;
  user?: User;
  created_at: string;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  action: string;
  entity_type: string | null;
  entity_id: number | null;
  description: string;
  changes: Record<string, unknown> | null;
  ip_address: string | null;
  user?: User;
  created_at: string;
}

export interface DashboardData {
  stats: {
    total_items: number;
    total_categories: number;
    total_locations: number;
    total_stock: number;
    low_stock: number;
    out_of_stock: number;
  };
  stock_flow: {
    labels: string[];
    in: number[];
    out: number[];
  };
  location_distribution: {
    id: number;
    name: string;
    total_stock: number;
    color: string | null;
  }[];
  recent_transfers: StockTransfer[];
  stock_alerts: Item[];
  recent_stock_in: StockIn[];
  recent_stock_out: StockOut[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}
