export type AccountType = {
    account_id: string;
    cron_task: any;
    dynamic_inputs: any[];
    dynamic_outputs: any[];
    is_external_update_enabled: boolean;
    last_action: any;
    ready_to_withdraw: any[];
    static_streams: any[];
    total_incoming: any[];
    total_outgoing: any[];
    total_received: any[];
}