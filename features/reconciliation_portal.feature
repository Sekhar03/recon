# ============================================================================
# iServeU Reconciliation Platform — Complete Gherkin Specification
# Technology: React 18 + Vite + Lucide Icons + Axios + XLSX Export
# Font: Poppins (Google Fonts)
# Design: Premium glassmorphism cards, teal brand (#119db0), dark navy sidebar
# ============================================================================

@portal @complete
Feature: iServeU Reconciliation Platform
  As a Finance Admin or Product Manager at iServeU Technology
  I want a streamlined 6-page sequential reconciliation wizard in Product Recon
  So that I can select product categories, configure date & cycle, collect source files per page, auto-fetch cloud logs, and run reconciliations
  And download exactly 2 output files: Matched File (.xlsx) & Mismatched File (.xlsx)

  # ──────────────────────────────────────────────────────────────────────────
  # SECTION 1: DESIGN SYSTEM & THEMING
  # ──────────────────────────────────────────────────────────────────────────

  @design @theme
  Scenario: Global Design System and CSS Variables
    Given the application uses the following CSS custom properties (variables):
      | Variable             | Value                          | Purpose                    |
      | --primary            | #119db0                        | iServeU brand teal         |
      | --primary-dark       | #0e8696                        | Hover/active teal          |
      | --primary-light      | #23c5da                        | Light teal accent          |
      | --secondary          | #1b2a3e                        | Dark navy (sidebar, text)  |
      | --secondary-light    | #253650                        | Lighter navy               |
      | --bg-main            | #f0f4f8                        | Page background            |
      | --bg-card            | #ffffff                        | Card backgrounds           |
      | --bg-hover           | #f1f5f9                        | Hover/subtle backgrounds   |
      | --bg-sidebar         | #1b2a3e                        | Sidebar background         |
      | --text-primary       | #1b2a3e                        | Main text color            |
      | --text-secondary     | #475569                        | Muted text                 |
      | --border             | #e2e8f0                        | Default border color       |
      | --border-focus       | #119db0                        | Focus ring color           |
      | --success            | #10b981                        | Green success              |
      | --danger             | #ef4444                        | Red danger/error           |
      | --warning            | #f59e0b                        | Amber warning              |
    And the global font-family is "Poppins" from Google Fonts
    And all cards use glass-card styling with border-radius 20px and shadow

  # ──────────────────────────────────────────────────────────────────────────
  # SECTION 2: LOGIN & NAVIGATION
  # ──────────────────────────────────────────────────────────────────────────

  @login @navigation
  Scenario: Authentication and Main Navigation
    Given the user is on the login page
    When the user selects "Finance Admin" role and clicks "Sign In"
    Then the user is redirected to Product Recon (`product-recon`) as default landing page
    And the sidebar navigation displays:
      | Module Key    | Label         | Icon     |
      | product-recon | Product Recon | Layers   |
      | job-archives  | Job Archives  | History  |
    And the Reconciliation Hub module is removed from navigation

  # ──────────────────────────────────────────────────────────────────────────
  # SECTION 3: PRODUCT RECON — 6-PAGE WIZARD SPECIFICATION
  # ──────────────────────────────────────────────────────────────────────────

  @product-recon @wizard
  Scenario: Page 1 — Category Selection
    Given I am on Page 1 of Product Recon
    Then Category Cards display for AEPS, MATM, IMPS, BBPS, RECHARGE, UPI, DMT, POS / CASHPOINT, RBL CASHOUT/PAYOUT, PREPAID CARD, UPI ACQUIRING, WALLET RECON, COMMISSION RECON, and BOB PROJECT
    And each Category Card shows Title and Icon only
    When I click a Category Card
    Then the application immediately advances to Page 2 (Sub-Product) without requiring a proceed button click

  @product-recon @wizard
  Scenario: Page 2 — Sub-Product Selection
    Given I am on Page 2 of Product Recon
    Then Sub-Product Cards display as clean box cards matching main product style
    And yellow "[Manual]" headers are completely removed
    When I click a Sub-Product Card
    Then the application immediately advances to Page 3 (Date & Cycle) without requiring a proceed button click

  @product-recon @wizard
  Scenario: Page 3 — Date & Cycle Selection
    Given I am on Page 3 of Product Recon
    Then I select Business Date (T) and Settlement Cycle (All Cycles / Cycle 1-4)
    When I click "Next: Collect Source Files →"
    Then the application advances to Page 4 (Per-File Collection)

  @product-recon @wizard @autofetch
  Scenario: Page 4 — Dedicated Per-File Pages & Zero-Click Auto-Fetch
    Given I am on Page 4 of Product Recon
    Then each required source file renders on its own dedicated page (File 1 of N, File 2 of N...)
    And for internal system logs (Middleware, Switch, Wallet, COU):
      | Parameter        | Specification                                                      |
      | Channel          | GCP Bucket (`gs://prod-isurecon/`) / SFTP (`switch.iserveu.in`)   |
      | Auto-Fetch Start | Starts automatically on page render without button click           |
      | Progress         | Animated progress bar 0% -> 100%                                   |
      | Terminal Console | Dark terminal typing console removed                              |
      | Success Card     | Light green card with "✔ Successfully auto-fetched transaction records" |
      | File Preview     | Data preview table rendered directly below success card           |
    And for external bank files (Finacle CBS, NPCI Settlement):
      | Parameter        | Specification                                                      |
      | Channel          | User Drag & Drop upload zone                                       |
    And "Previous File" and "Next File →" navigation buttons are provided

  @product-recon @wizard @processing
  Scenario: Page 5 — Processing Engine
    Given all required source files are collected
    When I click "Start Reconciliation Engine ▶"
    Then Page 5 renders a clean progress card with an animated spinner and step status list
    And dark console typing box is removed
    And upon completion, the application automatically advances to Page 6 (Results)

  @product-recon @wizard @results
  Scenario: Page 6 — Final Results & Exactly 2 Downloadable Output Files
    Given reconciliation processing is complete
    Then Page 6 displays:
      | Element           | Specification                                                    |
      | Summary Cards     | Total Analyzed, Matched, Mismatched, Match Rate (Auto-fit grid)  |
      | Data Table        | Searchable record table with tab filters (Matched / Mismatched)  |
      | Output File 1     | 🟢 **Download Matched File ([Count] Records)** (`.xlsx`)          |
      | Output File 2     | 🔴 **Download Mismatched File ([Count] Records)** (`.xlsx`)        |
    And exactly 2 output files are generated for download
