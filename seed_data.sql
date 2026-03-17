USE workflow_engine;

SET @wf_id = UUID();
SET @step1_id = UUID();
SET @step2_id = UUID();
SET @step3_id = UUID();
SET @step4_id = UUID();

INSERT INTO workflows (id, name, version, is_active, input_schema, start_step_id, created_by)
VALUES (
    @wf_id,
    'Expense Approval',
    1,
    TRUE,
    JSON_OBJECT('fields', JSON_ARRAY(
        JSON_OBJECT('name', 'amount', 'type', 'number', 'required', true),
        JSON_OBJECT('name', 'priority', 'type', 'string', 'required', true, 'allowed_values', JSON_ARRAY('High','Medium','Low'))
    )),
    @step1_id,
    NULL
);

INSERT INTO steps (id, workflow_id, name, step_type, step_order) VALUES
(@step1_id, @wf_id, 'Manager Approval', 'approval', 1),
(@step2_id, @wf_id, 'Finance Notification', 'notification', 2),
(@step3_id, @wf_id, 'CEO Approval', 'approval', 3),
(@step4_id, @wf_id, 'Task Rejection', 'task', 4);

INSERT INTO rules (id, step_id, rule_condition, next_step_id, priority) VALUES
(UUID(), @step1_id, "amount > 100 && priority == 'High'", @step2_id, 1),
(UUID(), @step1_id, 'amount <= 100', @step3_id, 2),
(UUID(), @step1_id, 'DEFAULT', @step4_id, 99);