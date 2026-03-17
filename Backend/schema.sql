USE workflow_engine;

DROP TABLE IF EXISTS execution_logs;
DROP TABLE IF EXISTS executions;
DROP TABLE IF EXISTS rules;
DROP TABLE IF EXISTS steps;
DROP TABLE IF EXISTS workflows;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE workflows (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    version INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    input_schema JSON,
    start_step_id CHAR(36),
    created_by CHAR(36),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE steps (
    id CHAR(36) PRIMARY KEY,
    workflow_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    step_type ENUM('task','approval','notification') DEFAULT 'task',
    step_order INT DEFAULT 0,
    metadata JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_workflow_id (workflow_id)
);

CREATE TABLE rules (
    id CHAR(36) PRIMARY KEY,
    step_id CHAR(36) NOT NULL,
    `condition` TEXT NOT NULL,
    next_step_id CHAR(36),
    priority INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_step_id (step_id)
);

CREATE TABLE executions (
    id CHAR(36) PRIMARY KEY,
    workflow_id CHAR(36) NOT NULL,
    workflow_version INT DEFAULT 1,
    status ENUM('pending','in_progress','completed','failed','canceled') DEFAULT 'pending',
    data JSON,
    current_step_id CHAR(36),
    retries INT DEFAULT 0,
    triggered_by VARCHAR(255),
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    INDEX idx_workflow_id (workflow_id)
);

CREATE TABLE execution_logs (
    id CHAR(36) PRIMARY KEY,
    execution_id CHAR(36) NOT NULL,
    step_name VARCHAR(255),
    step_type VARCHAR(50),
    evaluated_rules JSON,
    selected_next_step CHAR(36),
    status VARCHAR(50),
    approver_id VARCHAR(255),
    error_message TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    INDEX idx_execution_id (execution_id)
);