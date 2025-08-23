# Database Schema Design
Based on the actual model implementations, here's the database schema design:

## Core Entities

### Table team
- id: bigint, primary key, auto-increment
- label: varchar(255), not null
- name: varchar(255), unique, not null
- created_at: timestamp with time zone
- updated_at: timestamp with time zone

### Table users
- id: bigint, primary key, auto-increment
- team_id: bigint, not null (foreign key reference to team.id)
- email: varchar(255), not null, indexed
- display_name: varchar(255), not null
- google_id: varchar(255) (nullable for google login)
- password_hash: varchar(255) (nullable for password login)
- settings: jsonb, not null (user preferences, UI settings)
- created_at: timestamp with time zone
- updated_at: timestamp with time zone

**Indexes:**
- team_id + email: unique composite index
- email: single column index

### Table plans
- id: bigint, primary key, auto-increment
- name: varchar(255), unique, not null
- description: text
- max_audio_tokens: decimal, not null
- max_text_tokens: decimal, not null
- monthly_price: decimal, default 0
- annual_price: decimal, default 0
- created_at: timestamp with time zone
- updated_at: timestamp with time zone

### Table subscriptions
- id: bigint, primary key, auto-increment
- team_id: bigint, not null (foreign key reference to team.id)
- plan_id: bigint, not null (foreign key reference to plans.id)
- status: varchar(50), not null (enum: 'free', 'active', 'cancelled', 'expired')
- total_audio_tokens_used: decimal, default 0
- total_text_tokens_used: decimal, default 0
- current_period_start: timestamp with time zone
- current_period_end: timestamp with time zone
- cancel_at_period_end: boolean, default false
- created_at: timestamp with time zone
- updated_at: timestamp with time zone

**Indexes:**
- team_id: single column index
- plan_id: single column index

### Table ai_agents
- id: bigint, primary key, auto-increment
- creator_id: bigint, indexed (foreign key reference to users.id)
- team_id: bigint, indexed (foreign key reference to team.id)
- name: varchar(255), not null
- description: text
- persona_prompt: text, not null
- system_prompt: text, not null
- is_built_in: boolean, default false, not null
- settings: jsonb, not null (agent settings)
- deleted_at: timestamp with time zone (nullable)
- created_at: timestamp with time zone
- updated_at: timestamp with time zone

**Indexes:**
- creator_id: single column index
- team_id: single column index

### Table sessions
- id: bigint, primary key, auto-increment
- user_id: bigint, not null (foreign key reference to users.id)
- team_id: bigint, not null (foreign key reference to team.id)
- agent_id: bigint, not null (foreign key reference to ai_agents.id)
- status: varchar(50), not null (enum: 'created', 'in_progress', 'paused', 'completed', 'failed')
- started_at: timestamp with time zone, not null
- ended_at: timestamp with time zone (nullable)
- duration_minutes: decimal, default 0, not null
- data: jsonb, not null
  - audio_url: text (DigitalOcean Spaces URL)
  - transcript + timestamp: array of objects (transcript and timestamp of the transcript)
  - temp context that user provides for the agent in the current session
- usage: jsonb, not null (contains audio_tokens, text_tokens for the session)
- created_at: timestamp with time zone
- updated_at: timestamp with time zone

**Indexes:**
- user_id: single column index
- team_id: single column index
- agent_id: single column index

### Table feedbacks
- id: bigint, primary key, auto-increment
- user_id: bigint, not null (foreign key reference to users.id)
- team_id: bigint, not null (foreign key reference to team.id)
- data: jsonb, not null
- created_at: timestamp with time zone
- updated_at: timestamp with time zone

**Indexes:**
- user_id: single column index
- team_id: single column index

## Design Decisions
- We never want to have foreign key at the database level, it will be handled in the application layer.
- All tables use bigint for auto-incrementing IDs to handle large scale
- JSONB fields optimize storage for structured but flexible data
- Audio files stored externally (DigitalOcean Spaces) with URLs in database
- All tables use underscored naming convention (snake_case)
- Timestamps are automatically managed by Sequelize

### Business Logic Constraints
- team_id + email combination in users table must be unique
- Decimal type is used for token/limit fields to support fractional values
- Deleted agents are soft-deleted with deleted_at timestamp
- Subscription status transitions are managed at application level