# language: en
@recon @iserveu @functional
Feature: iServeU Recon Platform — Functional Workflows
  As a Finance Admin or Product Manager
  I want to reconcile financial transactions across NPCI, Switch, Middleware, Wallet, and BAV nodes
  So that I can run reconciliations, review results, export reports, and monitor job history

  Application scope:
  - Products: mATM (4-way, cycle-wise), DMT (3-way, day-wise), AePS Cash Deposit (5-way, cycle-wise)
  - Screens: Login, Dashboard, Analytics, Reconciliation Wizard, History Log, Results, Settings
  - Backend API: Express mock server on port 3001

  # ═══════════════════════════════════════════════════════════════════════════
  # AUTHENTICATION
  # ═══════════════════════════════════════════════════════════════════════════

  @auth @smoke
  Rule: Login and session

    Background:
      Given the Recon Platform frontend is running
      And the mock API server is running on port 3001

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
      Then I should be redirected to the Dashboard
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

    Scenario: Both roles access all application modules
      Given I am signed in as "<role>"
      Then I should see sidebar navigation "Dashboard", "Analytics", "Start Recon", "History Log", and "Settings"

      Examples:
        | role            |
        | Finance Admin   |
        | Product Manager |

  # ═══════════════════════════════════════════════════════════════════════════
  # NAVIGATION & SHELL
  # ═══════════════════════════════════════════════════════════════════════════

  @navigation @smoke
  Rule: Sidebar navigation and application shell

    Background:
      Given I am signed in as "Finance Admin"

    Scenario Outline: Navigate to each main screen
      When I click "<nav_item>" in the sidebar
      Then the "<nav_item>" nav item should be active
      And the page title should be "<page_title>"
      And the page subtitle should be "<page_subtitle>"

      Examples:
        | nav_item    | page_title                 | page_subtitle                                            |
        | Dashboard   | Internal Console / Finance | Welcome back. Select an action to begin.                 |
        | Analytics   | Core Visualizations        | Key transaction trends and health metrics.               |
        | Start Recon | Reconciliation Wizard      | Trigger a 5-way matching process across financial nodes. |
        | History Log | Job Archives               | Audit trail of all previous automated runs.              |
        | Settings    | System Settings            |                                                          |

    Scenario: Sidebar shows iServeU Recon Engine branding and user profile
      Then I should see the iServeU logo in the sidebar
      And I should see "Recon Engine" branding text
      And I should see the signed-in user name and role in the sidebar footer

    Scenario: Header shows global search and notifications bell
      Then I should see a search input with placeholder "Search..."
      And I should see the notifications bell icon

    Scenario: Mobile sidebar opens and closes
      Given the viewport width is 768 pixels or less
      When I open the mobile menu
      Then the sidebar should be visible as an overlay
      When I close the mobile menu
      Then the sidebar overlay should be hidden

  # ═══════════════════════════════════════════════════════════════════════════
  # DASHBOARD
  # ═══════════════════════════════════════════════════════════════════════════

  @dashboard
  Rule: Dashboard home and quick start

    Background:
      Given I am signed in as "Finance Admin"
      And I am on the "Dashboard" screen

    Scenario: Dashboard shows reconciliation overview
      Then I should see the heading "Automated Financial Reconciliation"
      And I should see product coverage for mATM, AePS, and DMT
      And I should see "BigQuery Secure Extraction"
      And I should see "Multi-Node Matching"

    Scenario: Start New Reconciliation opens the wizard
      When I click "Start New Reconciliation"
      Then I should be on the "Start Recon" screen
      And the Reconciliation Wizard should be on Step 1

  # ═══════════════════════════════════════════════════════════════════════════
  # RECONCILIATION WIZARD
  # ═══════════════════════════════════════════════════════════════════════════

  @wizard @reconciliation @smoke
  Rule: Reconciliation Wizard — complete 5-step workflow

    Background:
      Given I am signed in as "Finance Admin"
      And I navigate to "Start Recon"

    Scenario: Wizard displays 5-step progress indicator
      Then I should see wizard steps 1 through 5
      And Step 1 should be the current active step

    # ── Step 1: Product Category ──────────────────────────────────────────────

    Scenario: Step 1 lists all product categories
      Then I should see "Product Category" heading
      And I should see product "mATM" with type "Cycle-wise"
      And I should see product "DMT" with type "Day-wise"
      And I should see product "AePS Cash Deposit" with type "Cycle-wise"

    Scenario: Step 1 requires product selection before proceeding
      Given no product is selected
      Then the "Configure Parameters" button should be disabled
      When I select product "mATM"
      Then the "Configure Parameters" button should be enabled

    Scenario Outline: Select each product and proceed to Step 2
      When I select product "<product>"
      And I click "Configure Parameters"
      Then I should be on Wizard Step 2 "Reconciliation Scope"
      And the available issuing banks should be "<banks>"

      Examples:
        | product           | banks              |
        | mATM              | IPPB, NSDL         |
        | DMT               | Airtel, FINO, NSDL |
        | AePS Cash Deposit | NSDL, IPPB, FINO   |

    # ── Step 2: Reconciliation Scope ──────────────────────────────────────────

    Scenario Outline: Cycle-wise products require bank, date, and settlement cycle
      Given I selected product "<product>" and proceeded to Step 2
      Then I should see "Issuing Bank" selector
      And I should see "Reconciliation Date" field
      And I should see "Settlement Cycle" selector
      When I select bank "<bank>" without selecting a cycle
      Then the "Verify Data Availability" button should be disabled
      When I select settlement cycle "<cycle>"
      Then the "Verify Data Availability" button should be enabled

      Examples:
        | product           | bank | cycle   |
        | mATM              | NSDL | Cycle 3 |
        | mATM              | IPPB | Cycle 1 |
        | AePS Cash Deposit | IPPB | Cycle 2 |
        | AePS Cash Deposit | FINO | Cycle 5 |

    Scenario Outline: DMT day-wise product requires bank and date only
      Given I selected product "DMT" and proceeded to Step 2
      Then I should not see "Settlement Cycle" selector
      When I select bank "<bank>"
      And I set reconciliation date to "2026-04-07"
      Then the "Verify Data Availability" button should be enabled

      Examples:
        | bank   |
        | Airtel |
        | FINO   |
        | NSDL   |

    Scenario: Step 2 back navigation preserves product selection
      Given I selected product "mATM" and proceeded to Step 2
      When I click "Back"
      Then I should be on Step 1
      And product "mATM" should still be selected

    Scenario: All settlement cycles are selectable for cycle-wise products
      Given I selected product "mATM" and proceeded to Step 2
      Then I should see settlement cycles Cycle 1 through Cycle 10 with their time windows

    # ── Step 3: BigQuery Extraction ───────────────────────────────────────────

    Scenario: Step 3 runs BigQuery extraction automatically
      Given I completed Step 2 for product "mATM" bank "NSDL" cycle "Cycle 3"
      When I proceed to Step 3
      Then I should see "BigQuery Extraction" heading
      And extraction should reference dataset "isure-prod-dataset"
      And extraction should reference bank "NSDL"
      And extraction progress should be displayed from 0% to 100%
      And I should see extraction status messages during the process

    Scenario: Step 3 requires extraction completion before proceeding
      Given I am on Wizard Step 3 with extraction in progress
      Then the "Proceed to NPCI Upload" button should be disabled
      When extraction reaches 100%
      Then the "Proceed to NPCI Upload" button should be enabled

    Scenario: Step 3 back navigation returns to Step 2
      Given I am on Wizard Step 3
      When I click "Back"
      Then I should be on Step 2 with bank, date, and cycle preserved

    # ── Step 4: NPCI Upload ───────────────────────────────────────────────────

    Scenario: Step 4 accepts NPCI settlement file upload
      Given I completed Wizard Steps 1 through 3
      When I am on Step 4
      Then I should see "Upload Settlement Report" heading
      And I should see supported formats ".CSV, .XLSX (Max 20MB)"
      When I upload file "npci_sample.csv"
      Then I should see filename "npci_sample.csv" displayed
      And I should see "File ready for matching"
      And the "Run Reconciliation" button should be enabled

    Scenario: Step 4 requires file before running reconciliation
      Given I am on Step 4 without a selected file
      Then the "Run Reconciliation" button should be disabled

    Scenario: Step 4 back navigation returns to Step 3
      Given I am on Wizard Step 4
      When I click "Back"
      Then I should be on Step 3

    # ── Step 5: Matching & Results ────────────────────────────────────────────

    Scenario: Step 5 runs matching engine and shows progress
      Given I completed Steps 1 through 4 with NPCI file uploaded
      When I click "Run Reconciliation"
      Then I should see "Matching in Progress" heading
      And I should see matching progress from 0% to 100%
      And I should see status "Initializing 5-way matching engine"
      And I should see status "Matching Switch vs BigQuery"
      And I should see status "Validating NPCI Settlement nodes"
      And I should see status "Cross-referencing Wallet balances"
      And I should see status "Generating audit journals"

    Scenario: Step 5 displays reconciliation results on completion
      When the reconciliation completes
      Then I should see "Reconciliation Complete" heading
      And I should see Total Transactions "10240"
      And I should see Matched "10105"
      And I should see Mismatched "135"
      And I should see Match Rate "98.7%"
      And I should see "Mismatch Preview (Top 5)" table
      And I should see mismatch reasons including "Status Mismatch" and "Missing in MW"

    Scenario: Completion popup shows summary and navigates to history
      When the reconciliation completes
      Then I should see popup "Reconciliation Completed"
      And the popup should show Overall Match Rate and Total Exceptions
      When I click "View Full Output Audit" on the popup
      Then I should be redirected to "History Log"
      And a success notification should be added

    Scenario: Dismiss completion popup and finish via Done
      When the reconciliation completes
      And I close the completion popup
      And I click "Done" on the results screen
      Then I should be redirected to "History Log"

    Scenario Outline: Complete full wizard workflow per product
      When I complete the wizard for product "<product>" bank "<bank>" with "<scope>"
      Then reconciliation should complete successfully
      And I should see results for a "<matching>" reconciliation

      Examples:
        | product           | bank  | scope   | matching |
        | mATM              | IPPB  | Cycle 1 | 4-way    |
        | mATM              | NSDL  | Cycle 3 | 4-way    |
        | DMT               | Airtel| Day-wise| 3-way    |
        | DMT               | FINO  | Day-wise| 3-way    |
        | AePS Cash Deposit | NSDL  | Cycle 5 | 5-way    |
        | AePS Cash Deposit | FINO  | Cycle 2 | 5-way    |

  # ═══════════════════════════════════════════════════════════════════════════
  # RESULTS VIEW
  # ═══════════════════════════════════════════════════════════════════════════

  @results @export
  Rule: Reconciliation results display and export

    Background:
      Given I am signed in as "Finance Admin"

    Scenario: Results screen shows summary statistics and job metadata
      Given I am viewing results for completed job "RECON-10492"
      Then I should see "Reconciliation Complete"
      And I should see Job ID "RECON-10492"
      And I should see stat boxes for Total Transactions, Matched, Mismatched, and Match Rate

    Scenario: Mismatch preview table shows transaction discrepancies
      Given I am viewing results with mismatch data
      Then I should see columns "RRN / ID", "Amount", "Bank Status", "MW Status", and "Failure Reason"
      And bank statuses may include SUCCESS, FAILED, PENDING, or NOT_FOUND
      And MW statuses may include SUCCESS, FAILED, PENDING, or NOT_FOUND

    Scenario: Download matched entries CSV
      Given I am viewing results for a completed job
      When I click "Download CSV" under "Matched Entries"
      Then a CSV file should be downloaded containing matched transaction records

    Scenario: Download mismatched entries CSV
      Given I am viewing results for a completed job
      When I click "Download CSV" under "Mismatched Entries"
      Then a CSV file should be downloaded containing mismatched transaction records

    Scenario: Share reconciliation result
      Given I am viewing results for a completed job
      When I click "Share Result"
      Then the reconciliation summary should be shared or copied to clipboard

    Scenario: Done returns to History Log
      Given I opened results from History Log
      When I click "Done"
      Then I should return to "History Log"

    Scenario: Results without data shows loading placeholder
      Given I navigate to results with no results data available
      Then I should see "Preparing Report..."
      And I should see "Go Back" button

    Scenario: Open results from History via view action
      Given I am on "History Log"
      When I click the view icon for job "RECON-10492"
      Then I should see results for job "RECON-10492"
      And the page title should be "Job: RECON-10492"

    Scenario: Open results from History by clicking Job ID
      Given I am on "History Log"
      When I click job ID "RECON-10491"
      Then I should see results for job "RECON-10491"

  # ═══════════════════════════════════════════════════════════════════════════
  # MATCH & MISMATCH REPORTS
  # ═══════════════════════════════════════════════════════════════════════════

  @reports @match @mismatch
  Rule: Match and mismatch report types across all products

    Background:
      Given I am signed in as "Finance Admin"
      And the mock API server is running on port 3001

    Scenario: Reconciliation produces summary match report on results screen
      Given I am viewing results for a completed reconciliation job
      Then the summary report should include:
        | metric              | description                                      |
        | Total Transactions  | Total records processed in the reconciliation    |
        | Matched             | Transactions aligned across all financial nodes  |
        | Mismatched          | Transactions with cross-system discrepancies     |
        | Match Rate          | Percentage of matched transactions               |

    Scenario Outline: Product-specific matching report types
      When I complete reconciliation for product "<product>"
      Then the matching report type should be "<matching_type>"
      And the report should reconcile across nodes "<nodes>"

      Examples:
        | product           | matching_type | nodes                                      |
        | mATM              | 4-way         | NPCI, Switch, Middleware, Wallet           |
        | DMT               | 3-way         | Gateway, Middleware, Wallet (join: RRN)    |
        | AePS Cash Deposit | 5-way         | NPCI, Switch, Middleware, Wallet, BAV      |

    # ── Matched Report (CSV) ──────────────────────────────────────────────────

    Scenario: Matched report CSV structure and content
      Given I am viewing results for a completed job with date "2026-04-07"
      When I download the matched entries report
      Then a CSV file "matched_report_2026-04-07.csv" should be downloaded
      And the matched report should contain columns:
        | column    |
        | rrn       |
        | date      |
        | amount    |
        | status    |
        | matchType |
      And each matched row should have matchType "Exact"
      And each matched row should have status "SUCCESS"

    Scenario: Matched report covers fully aligned transactions
      Given I am viewing results for a completed job
      When I download the matched entries report
      Then the report description should state amounts and statuses align across all systems
      And the report should contain one row per matched transaction count minus mismatched count

    # ── Mismatched Report (CSV) ───────────────────────────────────────────────

    Scenario: Mismatched report CSV structure and content
      Given I am viewing results for a completed job with date "2026-04-07"
      When I download the mismatched entries report
      Then a CSV file "mismatched_report_2026-04-07.csv" should be downloaded
      And the mismatched report should contain columns:
        | column     |
        | rrn        |
        | date       |
        | amount     |
        | bankStatus |
        | mwStatus   |
        | reason     |

    Scenario Outline: Mismatch report reason types with status combinations
      Given a reconciliation produces a mismatch with reason "<reason>"
      Then the mismatch report row should show bank status "<bank_status>"
      And the mismatch report row should show MW status "<mw_status>"
      And the failure reason should be "<reason>"

      Examples:
        | reason           | bank_status | mw_status  |
        | Status Mismatch  | SUCCESS     | FAILED     |
        | Amount Mismatch  | FAILED      | SUCCESS    |
        | Wallet Timeout   | SUCCESS     | PENDING    |
        | Missing in MW    | SUCCESS     | NOT_FOUND  |

    Scenario: Wizard reconciliation mismatch report sample entries
      When I complete a wizard reconciliation for mATM
      Then the mismatch preview should include:
        | rrn          | amount     | bank_status | mw_status | reason          |
        | 612345678901 | 5,000.00   | SUCCESS     | FAILED    | Status Mismatch |
        | 612345678904 | 15,000.00  | SUCCESS     | NOT_FOUND | Missing in MW   |

    Scenario: API-created job mismatch report sample entries
      Given a new job is created via POST "/api/v1/jobs"
      When the job completes
      Then the mismatch report should include entries with reasons:
        | reason          | bank_status | mw_status |
        | Status Mismatch | SUCCESS     | FAILED    |
        | Amount Mismatch | FAILED      | SUCCESS   |
        | Wallet Timeout  | SUCCESS     | PENDING   |

    Scenario: Mismatch preview shows top 5 discrepancies on results screen
      Given I am viewing results with mismatch data
      Then I should see "Mismatch Preview (Top 5)" section
      And each row should display RRN, Amount, Bank Status, MW Status, and Failure Reason
      And failure reasons should be highlighted as discrepancy tags

    Scenario: Mismatched report is empty when no discrepancies exist
      Given I am viewing results for a job with zero mismatched transactions
      When I download the mismatched entries report
      Then no mismatched CSV file should be generated

    # ── History & Job-Level Reports ───────────────────────────────────────────

    Scenario: History export report contains all job records
      Given I am on "History Log"
      When I click "Export History"
      Then a CSV file "recon_history_export.csv" should be downloaded
      And the export should include job fields Job ID, Product, Bank, Date, Cycle, Status, Match Rate, and Run By
      And the export should not include nested results objects

    Scenario: Per-job mismatch export from History Log
      Given I am on "History Log"
      When I download the mismatch report for job "RECON-10492"
      Then a CSV file "mismatches_RECON-10492.csv" should be downloaded

    Scenario Outline: Completed job match rate report tiers in History
      Given I am on "History Log"
      Then job "<job_id>" should show match rate "<rate>" with indicator "<indicator>"

      Examples:
        | job_id       | rate   | indicator |
        | RECON-10483  | 99.9%  | green     |
        | RECON-10489  | 99.8%  | green     |
        | RECON-10487  | 99.1%  | primary   |
        | RECON-10492  | 98.7%  | primary   |
        | RECON-10488  | 97.4%  | warning   |
        | RECON-10485  | 96.8%  | warning   |

    Scenario Outline: Failed job reports show zero match rate
      Given I am on "History Log"
      Then failed job "<job_id>" should show match rate "0%" and status "Failed"

      Examples:
        | job_id       |
        | RECON-10490  |
        | RECON-10484  |

    Scenario Outline: Failed job error report types
      Given failed job "<job_id>" exists in History
      When I view the job record
      Then the job failure reason should be "<error>"

      Examples:
        | job_id       | error                        |
        | RECON-10490  | Upstream Timeout (MN)        |
        | RECON-10484  | Invalid NPCI Report Format   |

    # ── Source Report Formats (Input Files) ───────────────────────────────────

    Scenario: NPCI settlement report format for upload
      Given I am on Wizard Step 4 NPCI upload
      Then the accepted NPCI settlement report formats are ".CSV" and ".XLSX"
      And a valid NPCI sample report contains columns:
        | column           |
        | RRN              |
        | Transaction Date |
        | Amount           |
        | Status           |
        | Response Code    |
        | Terminal ID      |
      And NPCI transaction statuses may include SUCCESS, FAILED, and PENDING

    Scenario: BAV report format used in AePS 5-way matching
      Given I am reconciling product "AePS Cash Deposit"
      Then the 5-way match includes BAV report as an additional node
      And a valid BAV sample report contains columns:
        | column           |
        | Account Number   |
        | RRN              |
        | Transaction Date |
        | Amount           |
        | Type             |
        | Balance          |
      And BAV transaction types may include CR and DR

    # ── Analytics Mismatch Root Cause Report ──────────────────────────────────

    Scenario: Analytics mismatch root cause report by failure type
      Given I navigate to "Analytics"
      When analytics data has loaded
      Then the "Mismatch Root Causes" report should list:
        | failure_reason  | case_count |
        | Status Mismatch | 45         |
        | Amount Mismatch | 28         |
        | Timeout         | 15         |
        | Missing in MN   | 12         |

    Scenario: Share result report contains reconciliation summary
      Given I am viewing results for product "mATM" bank "NSDL" date "2026-04-07"
      When I click "Share Result"
      Then the shared report should include product name, bank, date, match rate, and total transactions

    Scenario: Completion popup match summary report
      When I complete a wizard reconciliation
      Then the completion popup should show:
        | field               |
        | Overall Match Rate  |
        | Total Exceptions    |
        | Job ID              |

    Scenario Outline: Match report per product from History results
      Given I am on "History Log"
      When I open results for job "<job_id>"
      Then the match report should show product "<product>" bank "<bank>"
      And total transactions "<total>" matched "<matched>" mismatched "<mismatched>" rate "<rate>"

      Examples:
        | job_id       | product | bank  | total | matched | mismatched | rate   |
        | RECON-10492  | mATM    | NSDL  | 10240 | 10105   | 135        | 98.7%  |
        | RECON-10491  | AePS    | IPPB  | 8500  | 8410    | 90         | 98.9%  |
        | RECON-10489  | mATM    | IPPB  | 12000 | 11980   | 20         | 99.8%  |
        | RECON-10488  | AePS    | NSDL  | 15400 | 15000   | 400        | 97.4%  |
        | RECON-10487  | DMT     | FINO  | 7200  | 7135    | 65         | 99.1%  |
        | RECON-10486  | mATM    | NSDL  | 9500  | 9330    | 170        | 98.2%  |
        | RECON-10485  | AePS    | FINO  | 11000 | 10648   | 352        | 96.8%  |
        | RECON-10483  | mATM    | IPPB  | 25000 | 24975   | 25         | 99.9%  |

    Scenario: Reconciliation rules affect mismatch threshold reporting
      Given I navigate to "Settings"
      Then the Auto-Trigger Threshold of 2.5% defines when jobs are flagged for high mismatch rate
      And the Strict Match Amount threshold of ₹0.05 defines ignored amount discrepancies

  # ═══════════════════════════════════════════════════════════════════════════
  # HISTORY LOG
  # ═══════════════════════════════════════════════════════════════════════════

  @history @smoke
  Rule: Job Archives — browse, search, filter, and export

    Background:
      Given I am signed in as "Finance Admin"
      And the mock API server is running on port 3001
      And I navigate to "History Log"

    Scenario: History loads job list from API
      When the history table finishes loading
      Then I should see jobs sorted by most recent first
      And the table should show columns Job ID, Product, Bank, Date / Cycle, Status, Match Rate, Run By, and Actions

    Scenario: History displays all seeded reconciliation jobs
      Then I should see job "RECON-10492" product "mATM" bank "NSDL" status "Completed" rate "98.7%"
      And I should see job "RECON-10491" product "AePS" bank "IPPB" status "Completed" rate "98.9%"
      And I should see job "RECON-10490" product "DMT" bank "Airtel" status "Failed"
      And I should see job "RECON-10489" product "mATM" bank "IPPB" status "Completed" rate "99.8%"
      And I should see job "RECON-10488" product "AePS" bank "NSDL" status "Completed" rate "97.4%"
      And I should see job "RECON-10487" product "DMT" bank "FINO" status "Completed" rate "99.1%"
      And I should see job "RECON-10486" product "mATM" bank "NSDL" status "Completed" rate "98.2%"
      And I should see job "RECON-10485" product "AePS" bank "FINO" status "Completed" rate "96.8%"
      And I should see job "RECON-10484" product "DMT" bank "NSDL" status "Failed"
      And I should see job "RECON-10483" product "mATM" bank "IPPB" status "Completed" rate "99.9%"

    Scenario Outline: Search history by Job ID, product, or bank
      When I search history for "<query>"
      Then only jobs matching "<query>" should be visible

      Examples:
        | query       |
        | RECON-10492 |
        | matm        |
        | NSDL        |
        | aeps        |
        | fino        |

    Scenario Outline: Filter history by status
      When I filter history by status "<status>"
      Then all visible jobs should match status filter "<status>"

      Examples:
        | status    |
        | all       |
        | completed |
        | failed    |
        | running   |

    Scenario Outline: Filter history by product
      When I filter history by product "<product>"
      Then all visible jobs should have product "<product>"

      Examples:
        | product |
        | all     |
        | mATM    |
        | AePS    |
        | DMT     |

    Scenario: Completed jobs show green Completed badge
      Then completed jobs should display "Completed" status badge

    Scenario: Failed jobs show red Failed badge
      Then failed jobs "RECON-10490" and "RECON-10484" should display "Failed" status badge

    Scenario: Match rate indicator uses color thresholds
      Then jobs above 99% match rate should show green progress indicator
      And jobs above 95% match rate should show primary color indicator
      And jobs at or below 95% match rate should show warning color indicator

    Scenario: View job details from actions menu
      When I click the more details icon for job "RECON-10492"
      Then I should see job details including Product, Bank, and Run By user

    Scenario: Export full history as CSV
      When I click "Export History"
      Then a CSV file "recon_history_export" should be downloaded with all job records

    Scenario: Download mismatch CSV for a completed job
      When I click the download icon for job "RECON-10492"
      Then a mismatch CSV file should be downloaded for that job

    Scenario: Combined search and filter narrows results
      When I search history for "NSDL"
      And I filter history by product "mATM"
      And I filter history by status "completed"
      Then only completed mATM jobs for NSDL should be visible

  # ═══════════════════════════════════════════════════════════════════════════
  # ANALYTICS
  # ═══════════════════════════════════════════════════════════════════════════

  @analytics
  Rule: Analytics dashboard and visualizations

    Background:
      Given I am signed in as "Finance Admin"
      And the mock API server is running on port 3001

    Scenario: Analytics loads data from stats API
      When I navigate to "Analytics"
      Then analytics data should load from GET "/api/v1/stats"
      And the analytics dashboard should be displayed

    Scenario: Match Rate Performance chart shows weekly trends
      Given analytics data has loaded
      Then I should see "Match Rate Performance" chart
      And I should see subtitle "Weekly accuracy across all products"
      And the chart should show daily trend labels Mon through Sun

    Scenario: Product Distribution chart shows product split
      Given analytics data has loaded
      Then I should see "Product Distribution" chart
      And I should see subtitle "Volume split by financial product"
      And I should see mATM, AePS, and DMT distribution labels

    Scenario: Mismatch Root Causes chart shows failure breakdown
      Given analytics data has loaded
      Then I should see "Mismatch Root Causes" chart
      And I should see failure reasons with case counts:
        | reason          | cases |
        | Status Mismatch | 45    |
        | Amount Mismatch | 28    |
        | Timeout         | 15    |
        | Missing in MN   | 12    |

  # ═══════════════════════════════════════════════════════════════════════════
  # NOTIFICATIONS
  # ═══════════════════════════════════════════════════════════════════════════

  @notifications
  Rule: In-app notification alerts

    Background:
      Given I am signed in as "Finance Admin"

    Scenario: Pre-seeded notifications appear on login
      Then I should see unread notification badge with count "2"
      And notifications should include:
        | title                  | message                                      |
        | Reconciliation Success | RECON-10492 matched at 99.2%                 |
        | New File Detected      | AePS Cycle 4 files are ready.                |
        | System Alert           | Disk usage at 85% on prod-mw.                |

    Scenario: Open and read notifications
      When I click the notifications bell icon
      Then I should see "Recent Alerts" panel
      And I should see all notification titles and messages
      When I click "Mark read"
      Then all notifications should be marked as read
      And the unread badge should be removed

    Scenario: Wizard completion adds a new notification
      Given I complete a reconciliation via the wizard
      Then a notification "Reconciliation Success ✅" should be added
      And the notification should include product, bank, and match rate

  # ═══════════════════════════════════════════════════════════════════════════
  # SETTINGS
  # ═══════════════════════════════════════════════════════════════════════════

  @settings
  Rule: System settings configuration

    Background:
      Given I am signed in as "Finance Admin"
      And I navigate to "Settings"

    Scenario: Settings page displays configuration sections
      Then I should see "System Settings" heading
      And I should see settings sections:
        | section                |
        | Account & Security     |
        | Product Configurations |
        | API & Webhooks         |
        | Notification Rules     |
      And "Account & Security" should be the active section

    Scenario: Profile information fields are editable
      Then I should see "Username" field with value "finance_admin_01"
      And I should see "Display Name" field with value "Finance Executive"

    Scenario: Reconciliation rules are configurable
      Then I should see "Auto-Trigger Threshold" set to "2.5" percent
      And I should see "Strict Match (Amount)" set to "₹0.05"

    Scenario: Notification channel preferences are available
      Then I should see "Email Summary (Daily at 08:00 IST)" checked
      And I should see "Immediate Alerts for Failed Jobs" checked
      And I should see "Slack Integration (@recon-alerts)" unchecked

    Scenario: Save and reset actions are available
      Then I should see "Save All Changes" button
      And I should see "Reset to Default" button

  # ═══════════════════════════════════════════════════════════════════════════
  # API WORKFLOWS
  # ═══════════════════════════════════════════════════════════════════════════

  @api @backend
  Rule: Backend API supports reconciliation job lifecycle

    Background:
      Given the mock API server is running on port 3001

    Scenario: GET products returns all product configurations
      When I request GET "/api/v1/products"
      Then the response status should be 200
      And products should include mATM, DMT, and AePS Cash Deposit with banks and reconciliation types

    Scenario: GET stats returns analytics aggregates
      When I request GET "/api/v1/stats"
      Then the response status should be 200
      And the response should include totalJobs, completedToday, matchedRate, mismatchCount, runningCount
      And the response should include activeJobs, productDistribution, failureReasons, and trends

    Scenario: GET history returns all jobs newest first
      When I request GET "/api/v1/history"
      Then the response status should be 200
      And jobs should be ordered by createdAt descending

    Scenario: POST jobs creates and processes a reconciliation job
      When I request POST "/api/v1/jobs" with:
        | product | mATM          |
        | bank    | NSDL          |
        | date    | 2026-04-07    |
        | cycle   | 3             |
        | user    | finance_admin |
      Then the response status should be 201
      And the job should have status "running" and jobId matching "RECON-*"

    Scenario: GET job by ID returns job details
      When I request GET "/api/v1/jobs/RECON-10492"
      Then the response status should be 200
      And the job should include product, bank, date, cycle, status, and results

    Scenario: GET job by unknown ID returns not found
      When I request GET "/api/v1/jobs/RECON-99999"
      Then the response status should be 404
      And the error message should be "Job not found"

    Scenario: DELETE job removes job from history
      When I request DELETE "/api/v1/jobs/RECON-10483"
      Then the response status should be 204
      And GET "/api/v1/jobs/RECON-10483" should return 404

    Scenario: Completed API job includes mismatch data
      Given a job was created via POST "/api/v1/jobs"
      When the job completes
      Then results should include total, matched, mismatched, rate, and mismatchedData
      And mismatchedData entries should include RRN, amount, bankStatus, mwStatus, and reason

  # ═══════════════════════════════════════════════════════════════════════════
  # END-TO-END WORKFLOWS
  # ═══════════════════════════════════════════════════════════════════════════

  @e2e @smoke
  Rule: Complete user journeys across the application

    Scenario: Login to reconciliation to history audit trail
      Given the Recon Platform frontend and mock API are running
      When I sign in as "Finance Admin"
      And I start a new reconciliation from Dashboard
      And I complete the wizard for mATM NSDL Cycle 3 with "npci_sample.csv"
      Then I should see reconciliation results with 98.7% match rate
      And I should land on History Log with a success notification

    Scenario: History search, view results, export, and return
      Given I am signed in as "Finance Admin"
      And I am on "History Log"
      When I search for "RECON-10492"
      And I open the job results
      And I download mismatched entries CSV
      And I click "Done"
      Then I should return to History Log

    Scenario: Product Manager runs DMT day-wise reconciliation
      Given I am signed in as "Product Manager"
      When I navigate to "Start Recon"
      And I complete the wizard for DMT Airtel day-wise with "npci_sample.csv"
      Then reconciliation should complete successfully
      And I should see results and be redirected to History Log

    Scenario: Finance Admin reviews analytics after reconciliation
      Given I am signed in as "Finance Admin"
      And I am on "History Log" with loaded jobs
      When I navigate to "Analytics"
      Then I should see Match Rate Performance, Product Distribution, and Mismatch Root Causes
      When I navigate to "History Log"
      And I open a completed job result
      Then I should see full reconciliation output for audit review

    Scenario: Browse all modules in a single session
      Given I am signed in as "Finance Admin"
      When I visit Dashboard, Analytics, Start Recon, History Log, and Settings in sequence
      Then each screen should load its primary functional content without errors
