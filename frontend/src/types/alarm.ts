// src/types/alarm.ts
export interface AlarmGroup {
  id: number;
  name: string;
  client_id: number;
  device_id: number;
  selected_parse_rule_id?: number | null;
}

export interface AlarmAddress {
  alarm_no: number;
  address_type: string;
  address: string;
  address_bit: number;
  comments: AlarmComment[];
}

export interface AlarmComment {
  comment_id: number;
  comment: string;
}

export interface AlarmGroupFormData {
  name: string;
  client_id: number;
}

export interface AlarmGroupParseRuleSelectionData {
  selected_parse_rule_id: number | null;
}

export interface AlarmAddressFormData {
  alarm_no: number;
  address_type: string;
  address: string;
  address_bit: number;
  comments: AlarmComment[];
}

export type AlarmParseRuleOffsetMode = 'row_index_word' | 'preserve_address';
export type AlarmParseAlarmNoMode = 'line_index' | 'regex_group';
export type AlarmParseCommentMode = 'none' | 'csv_columns' | 'regex_group';

export interface AlarmParseRulePattern {
  id: number;
  rule_id: number;
  pattern_name: string;
  sort_order: number;
  regex_pattern: string;
  address_type_value?: string | null;
  address_type_group?: number | null;
  alarm_no_mode: AlarmParseAlarmNoMode;
  alarm_no_group?: number | null;
  alarm_no_offset: number;
  address_group?: number | null;
  bit_group?: number | null;
  combined_address_bit_group?: number | null;
  combined_address_bit_separator: string;
  comment_mode: AlarmParseCommentMode;
  comment_group?: number | null;
  comment_columns_start?: number | null;
  address_pad_length: number;
}

export interface AlarmParseRulePatternFormData {
  pattern_name: string;
  sort_order: number;
  regex_pattern: string;
  address_type_value?: string | null;
  address_type_group?: number | null;
  alarm_no_mode: AlarmParseAlarmNoMode;
  alarm_no_group?: number | null;
  alarm_no_offset: number;
  address_group?: number | null;
  bit_group?: number | null;
  combined_address_bit_group?: number | null;
  combined_address_bit_separator: string;
  comment_mode: AlarmParseCommentMode;
  comment_group?: number | null;
  comment_columns_start?: number | null;
  address_pad_length: number;
}

export interface AlarmParseRule {
  id: number;
  name: string;
  description?: string | null;
  is_active: boolean;
  skip_header_rows: number;
  offset_mode: AlarmParseRuleOffsetMode;
  patterns: AlarmParseRulePattern[];
}

export interface AlarmParseRuleFormData {
  name: string;
  description?: string | null;
  is_active: boolean;
  skip_header_rows: number;
  offset_mode: AlarmParseRuleOffsetMode;
  patterns: AlarmParseRulePatternFormData[];
}

export interface AlarmAddressParsePreviewRequest {
  csv_content: string;
  parse_rule_id?: number;
}

export interface AlarmAddressParsePreview {
  parse_rule_id: number;
  rule_name: string;
  offset_mode: AlarmParseRuleOffsetMode;
  addresses: AlarmAddress[];
  warnings: string[];
  processed_line_count: number;
  matched_line_count: number;
  unmatched_line_count: number;
}
