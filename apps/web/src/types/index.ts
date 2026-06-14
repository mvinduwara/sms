export type MessageStatus = "queued" | "sent" | "delivered" | "failed";

export interface Message {
  id: string;
  to: string;
  body: string;
  status: MessageStatus;
  provider_sid: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
  contact_name?: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  group_name: string | null;
  notes: string | null;
  created_at: string;
}

export interface Template {
  id: string;
  name: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface StatsOverview {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  queued: number;
  delivery_rate: number;
}

export interface DailyVolume {
  date: string;
  sent: number;
  delivered: number;
  failed: number;
}

export interface HourlyVolume {
  hour: number;
  count: number;
}

export interface AnalyticsData {
  overview: StatsOverview;
  daily: DailyVolume[];
  hourly: HourlyVolume[];
}

export interface ProviderConfig {
  provider: "twilio" | "mock";
  twilio_account_sid: string;
  twilio_auth_token: string;
  twilio_from_number: string;
  default_sender_id: string;
  rate_limit_per_second: number;
  webhook_url: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export interface BulkRecipient {
  phone: string;
  name?: string;
  [key: string]: string | undefined;
}