# language: en
@recon @iserveu @functional
Feature: iServeU Recon Platform — Product Recon Functional Workflows
  As a Finance Admin or Product Manager
  I want to reconcile financial transactions across NPCI, Switch, Middleware, Wallet, BAV, and Bank nodes
  So that I can run multi-source reconciliations, review results, and download matched and mismatched reports

  Application scope:
  - Modules: Product Recon (Primary), Job Archives
  - Categories: AEPS, MATM, IMPS, BBPS, RECHARGE, UPI, DMT, POS / Cashpoint, RBL CASHOUT/PAYOUT, PREPAID CARD, UPI ACQUIRING, WALLET RECON, COMMISSION RECON, BOB PROJECT
  - Screens: Login, Product Recon (6-Step Sequential Wizard & Per-File Pages), Job Archives, Results
  - Export: Exactly 2 output files — Matched File (.xlsx) & Mismatched File (.xlsx)

  # ═══════════════════════════════════════════════════════════════════════════
  # AUTHENTICATION
  # ═══════════════════════════════════════════════════════════════════════════

  @auth @smoke
  Rule: Login and session

    Background:
      Given the Recon Platform frontend is running

    Scenario: Login screen displays branding and role selection
      When I open the Recon Platform application
      Then I should see the iServeU logo
      And I should see the heading "Recon Platform"
      And I should see the subtitle "Automated Reconciliation Suite"
      And I should see the label "Select Access Role"
      And I should see the role "Product Manager" with description "System config & monitoring"
      And I should see the role "Finance Admin" with description "Audit, report & verify"
      And "Finance Admin" should be selected by default
      And I should see the footer "Powered by iServeU Technology Private Limited"

    Scenario Outline: Sign in with selected role
      Given I am on the login screen
      When I select the "<role_label>" access role
      And I click "Sign In"
      Then I should be redirected to Product Recon
      And the sidebar should display user name "<display_name>"
      And the sidebar should display user role "<role_display>"

      Examples:
        | role_label      | display_name   | role_display    |
        | Finance Admin   | Finance Exec   | Finance Admin   |
        | Product Manager | Logic Engineer | Product Manager |

    Scenario: Logout ends session and returns to login
      Given I am signed in as "Finance Admin"
      When I click "Logout Session" in the sidebar footer
      Then I should see the login screen

    Scenario: Navigation items — Product Recon and Job Archives
      Given I am signed in as "Finance Admin"
      Then I should see sidebar navigation "Product Recon" and "Job Archives"
      And "Product Recon" should be active by default

  # ═══════════════════════════════════════════════════════════════════════════
  # NAVIGATION & SHELL
  # ═══════════════════════════════════════════════════════════════════════════

  @navigation @smoke
  Rule: Sidebar navigation and application shell

    Background:
      Given I am signed in as "Finance Admin"

    Scenario Outline: Navigate between active modules
      When I click "<nav_item>" in the sidebar
      Then the "<nav_item>" nav item should be active

      Examples:
        | nav_item      |
        | Product Recon |
        | Job Archives  |

    Scenario: Sidebar shows iServeU Recon Engine branding and user profile
      Then I should see the iServeU logo in the sidebar
      And I should see "Reconciliation Platform" branding text
      And I should see the signed-in user name and role in the sidebar footer

  # ═══════════════════════════════════════════════════════════════════════════
  # PRODUCT RECON — 6-PAGE SEQUENTIAL WIZARD
  # ═══════════════════════════════════════════════════════════════════════════

  @wizard @product-recon @smoke
  Rule: Product Recon — 6-Page Sequential Wizard Workflow

    Background:
      Given I am signed in as "Finance Admin"
      And I am on the "Product Recon" module

    Scenario: Wizard displays responsive 6-step progress indicator
      Then I should see stepper indicators for "1. Category", "2. Sub-Product", "3. Date & Cycle", "4. Files", "5. Processing", and "6. Results"
      And Page 1 "Category" should be active by default

    # ── Page 1: Select Main Product Category ──────────────────────────────────

    Scenario: Page 1 displays minimal Category Cards and auto-advances
      When I view Page 1
      Then I should see Category Cards for "AEPS", "MATM", "IMPS", "BBPS", "RECHARGE", "UPI", "DMT", "POS / CASHPOINT", "RBL CASHOUT/PAYOUT", "PREPAID CARD", "UPI ACQUIRING", "WALLET RECON", "COMMISSION RECON", and "BOB PROJECT"
      And Category Cards should display title and icon only without description text
      When I click on Category Card "AEPS"
      Then I should automatically advance to Page 2 "Sub-Product" without clicking any proceed button

    # ── Page 2: Select Sub-Product ─────────────────────────────────────────────

    Scenario: Page 2 displays minimal Sub-Product Box Cards and auto-advances
      Given I selected category "AEPS" and am on Page 2
      Then I should see sub-product cards for "Aadharpay", "Fino AEPS", "NSDL AEPS", and "IPPB AEPS"
      And Sub-Product Cards should display title and arrow only with yellow "[Manual]" headers completely removed
      When I click on Sub-Product Card "NSDL AEPS"
      Then I should automatically advance to Page 3 "Date & Cycle" without clicking any proceed button

    # ── Page 3: Select Date & Settlement Cycle ────────────────────────────────

    Scenario: Page 3 configures target Business Date (T) and Settlement Cycle
      Given I selected sub-product "NSDL AEPS" and am on Page 3
      Then I should see a date picker for "Business Date (T)"
      And I should see a dropdown for "Settlement Cycle" with options "All Cycles (Daily Consolidated)", "Cycle 1", "Cycle 2", "Cycle 3", and "Cycle 4"
      When I select Business Date "2026-07-24" and Settlement Cycle "Cycle 1 (00:00 - 08:00)"
      And I click "Next: Collect Source Files →"
      Then I should advance to Page 4 "Dedicated Per-File Collection"

    # ── Page 4: Dedicated Per-File Pages & Cloud Auto-Fetch ───────────────────

    Scenario: Each required source file has its own dedicated page
      Given product "NSDL AEPS" has 3 required source files: "NPCI Settlement File", "Middleware Log File", and "Switch Log File"
      When I enter Page 4
      Then I should see "Source File 1 of 3: NSDL AEPS NPCI File"
      When I complete File 1 and click "Next File (2/3)"
      Then I should see "Source File 2 of 3: NSDL AEPS Middleware File"
      When I complete File 2 and click "Next File (3/3)"
      Then I should see "Source File 3 of 3: NSDL AEPS Switch File"

    Scenario: Auto-fetchable cloud log files start fetching automatically on page load
      Given source file "Middleware Log File" is marked as Auto-Fetch from GCP Bucket
      When I open the dedicated page for "Middleware Log File"
      Then the Cloud Auto-Fetch animation starts automatically without requiring a button click
      And progress smooth fills from 0% to 100%
      And a light success badge displays "Successfully auto-fetched 18,450 transaction records from Cloud Storage!"
      And an auto-fetched stream preview table displays sample transaction records

    Scenario: External counterparty bank files display drag-and-drop upload zone
      Given source file "NSDL AEPS NPCI File" is marked as User Upload
      When I open the dedicated page for "NSDL AEPS NPCI File"
      Then I should see a drag-and-drop upload zone
      And I should see "Upload NSDL AEPS NPCI File" with file browse link
      When I upload a file "nsdl_npci_20260724.csv"
      Then the file status shows "Upload Complete" and preview table is rendered

    # ── Page 5: Processing Engine ──────────────────────────────────────────────

    Scenario: Page 5 executes reconciliation engine with clean progress card
      Given all required source files are ready for "NSDL AEPS"
      When I click "Start Reconciliation Engine ▶"
      Then I should advance to Page 5 "Processing"
      And I should see a clean progress card with an animated spinner
      And I should see step status indicators with green checkmarks as steps complete
      And when processing completes, I should automatically advance to Page 6 "Results"

    # ── Page 6: Final Results & 2 Output File Downloads ───────────────────────

    Scenario: Page 6 displays KPI metrics, searchable table, and 2 output download buttons
      Given reconciliation for "NSDL AEPS" is complete
      Then I should be on Page 6 "Results"
      And I should see KPI summary cards for "Total Analyzed Records", "Matched / Settled", "Mismatched / Exceptions", and "Match Accuracy Rate"
      And the summary cards grid should use responsive auto-fit layout
      And I should see exactly 2 separate download buttons:
        | Button Label                     | File Name Pattern                      |
        | 🟢 Download Matched File         | [Product]_MATCHED_[Date]_[Cycle].xlsx  |
        | 🔴 Download Mismatched File      | [Product]_MISMATCHED_[Date]_[Cycle].xlsx |
