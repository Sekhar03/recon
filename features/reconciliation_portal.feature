# ============================================================================
# iServeU Reconciliation Platform — Complete Gherkin Specification
# Technology: React 18 + Vite + Lucide Icons + Axios + XLSX Export
# Font: Poppins (Google Fonts)
# Design: Premium glassmorphism cards, teal brand (#119db0), dark navy sidebar
# ============================================================================

@portal @complete
Feature: iServeU Reconciliation Platform
  As a Finance Admin or Product Manager at iServeU Technology
  I want a streamlined 4-step reconciliation pipeline with job archives
  So that I can reconcile UPI/DMT/AEPS/MATM transactions against NPCI reports
  And download Matched & Mismatched transaction reports

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
      | --text-muted         | #94a3b8                        | Very subtle text           |
      | --border             | #e2e8f0                        | Default border color       |
      | --border-focus       | #119db0                        | Focus ring color           |
      | --success            | #10b981                        | Green success              |
      | --success-glow       | rgba(16, 185, 129, 0.12)       | Success badge background   |
      | --danger             | #ef4444                        | Red danger/error           |
      | --danger-glow        | rgba(239, 68, 68, 0.12)        | Danger badge background    |
      | --warning            | #f59e0b                        | Amber warning              |
      | --warning-glow       | rgba(245, 158, 11, 0.12)       | Warning badge background   |
      | --info               | #3b82f6                        | Blue informational         |
      | --info-glow          | rgba(59, 130, 246, 0.12)       | Info badge background      |
      | --primary-glow       | rgba(17, 157, 176, 0.10)       | Primary selection glow     |
      | --shadow-sm          | 0 1px 3px rgba(0,0,0,0.06)     | Small shadow               |
      | --shadow-md          | 0 4px 12px rgba(0,0,0,0.08)    | Medium shadow              |
      | --shadow-lg          | 0 10px 28px rgba(0,0,0,0.10)   | Large shadow               |
      | --shadow-xl          | 0 20px 48px rgba(0,0,0,0.14)   | Extra large shadow         |
    And the global font-family is "Poppins" from Google Fonts with sans-serif fallback
    And all headings (h1-h4) use font-weight 600 and color var(--secondary)
    And the body has background var(--bg-main) with antialiased font smoothing

  @design @cards
  Scenario: Glass Card Component Styling
    Given cards use the class "glass-card" with the following properties:
      | Property      | Value                |
      | background    | var(--bg-card)       |
      | border        | 1px solid var(--border) |
      | border-radius | 20px                 |
      | box-shadow    | var(--shadow-md)     |
    And on hover the box-shadow transitions to var(--shadow-lg) over 0.3s ease

  @design @buttons
  Scenario: Button System
    Given the application has the following button variants:
      | Class         | Background        | Color   | Border                    | Hover Effect                              |
      | btn-primary   | var(--primary)    | white   | none                      | var(--primary-dark), translateY(-1px), shadow |
      | btn-outline   | white             | text    | 1.5px solid var(--border) | bg-hover, primary border and text         |
      | btn-danger    | var(--danger)     | white   | none                      | #dc2626 background                       |
      | btn-success   | var(--success)    | white   | none                      | standard                                  |
    And all buttons have border-radius 50px (fully rounded pill shape)
    And all buttons have padding 11px 22px, font-weight 600, font-size 13.5px
    And buttons display inline-flex with align-items center and gap 7px
    And disabled buttons have opacity 0.5 and cursor not-allowed

  @design @badges
  Scenario: Badge System
    Given the application uses inline badges with the following variants:
      | Class         | Background              | Text Color       |
      | badge-success | var(--success-glow)     | var(--success)   |
      | badge-danger  | var(--danger-glow)      | var(--danger)    |
      | badge-warning | var(--warning-glow)     | var(--warning)   |
      | badge-info    | var(--info-glow)        | var(--info)      |
      | badge-primary | var(--primary-glow)     | var(--primary)   |
    And all badges have border-radius 20px, font-size 11.5px, font-weight 700
    And badges display inline-flex with align-items center and gap 4px

  @design @animations
  Scenario: Animation System
    Given the application uses the following CSS animations:
      | Animation Name | Keyframes                                        | Class Name     | Duration |
      | fadeIn          | from opacity:0 translateY(12px) to opacity:1 translateY(0) | animate-fade-in | 0.35s ease-out |
      | spin            | from rotate(0deg) to rotate(360deg)             | animate-spin   | 0.85s linear infinite |
      | pulse           | 0%,100% opacity:1; 50% opacity:0.45             | icon-pulse     | 2.2s ease-in-out infinite |
      | slideInRight    | from translateX(120%) scale(0.9) opacity:0 to normal | slide-in-right | 0.45s cubic-bezier |

  @design @tables
  Scenario: Data Table Styling
    Given data tables use class "data-table" with width 100% and collapsed borders
    And table headers have background var(--bg-hover) with uppercase text at 11.5px
    And table cells have padding 13px 14px
    And table rows have 1px bottom border and hover background rgba(17,157,176,0.03)
    And table body font-size is 13.5px

  @design @forms
  Scenario: Form Input Styling
    Given form inputs use class "settings-input" with the following properties:
      | Property      | Value                          |
      | background    | white                          |
      | border        | 1.5px solid var(--border)      |
      | padding       | 11px 16px                      |
      | border-radius | 10px                           |
      | font-size     | 14px                           |
    And on focus the border changes to var(--primary) with box-shadow 0 0 0 3px var(--primary-glow)

  @design @responsive
  Scenario: Responsive Breakpoints
    Given the application supports the following responsive breakpoints:
      | Breakpoint    | Changes                                              |
      | max-width 1200px | Main content padding reduces to 24px 28px          |
      | max-width 900px  | Main content padding reduces to 20px 16px, grids adapt |
      | max-width 768px  | Sidebar hides off-screen, margin-left 0, mobile menu |
      | max-width 600px  | All grids collapse to single column                 |

  # ──────────────────────────────────────────────────────────────────────────
  # SECTION 2: LOGIN SCREEN
  # ──────────────────────────────────────────────────────────────────────────

  @login
  Scenario: Login Page Layout and Design
    Given the user is not authenticated
    Then the login page is displayed with:
      | Element              | Description                                              |
      | Background           | Full viewport gradient: 135deg from #1b2a3e to #119db0   |
      | Card                 | Centered glass-card, max-width 440px, border-radius 24px |
      | Card Shadow          | 0 25px 50px -12px rgba(0,0,0,0.25)                       |
      | Logo                 | iServeU logo from https://iserveu.in/wp-content/uploads/2024/01/ISERVEU-MAIN-LOGO.png, height 40px |
      | Title                | "Recon Platform" at 24px font-size                       |
      | Subtitle             | "Automated Reconciliation Suite" in text-secondary       |
      | Footer               | "Powered by iServeU Technology Private Limited"          |
    And the card has a fadeIn animation on mount

  @login
  Scenario: Role Selection on Login
    Given the login page is displayed
    Then I see 2 role selection cards stacked vertically:
      | Role               | Icon         | Title            | Subtitle                      |
      | product_engineer   | ShieldCheck  | Product Manager  | System config & monitoring    |
      | finance_admin      | UserCheck    | Finance Admin    | Audit, report & verify        |
    And each role card has:
      | Property      | Value                              |
      | padding       | 16px                               |
      | border-radius | 16px                               |
      | border        | 2px solid var(--border)            |
    And the active/selected role card has border-color var(--primary) and background var(--primary-glow)
    And the active role shows an 8px teal dot indicator on the right
    And the default selected role is "finance_admin"

  @login
  Scenario: Login Button and Authentication Flow
    Given a role is selected on the login page
    When I click the "Sign In" button
    Then the button shows a spinning RefreshCcw icon for 1.2 seconds
    And after 1.2 seconds I am logged in with user data:
      | Role             | User Name       | Role Label           |
      | finance_admin    | Finance Exec    | Finance Admin        |
      | product_engineer | Logic Engineer  | Product Manager      |
    And I am redirected to the main application with "Reconciliation Hub" as the active tab

  # ──────────────────────────────────────────────────────────────────────────
  # SECTION 3: MAIN APPLICATION LAYOUT
  # ──────────────────────────────────────────────────────────────────────────

  @layout @sidebar
  Scenario: Sidebar Navigation Structure
    Given I am logged into the application
    Then a fixed left sidebar is displayed with:
      | Property      | Value                        |
      | width         | 260px                        |
      | background    | var(--secondary) (#1b2a3e)   |
      | color         | white                        |
      | padding       | 24px 14px                    |
      | position      | fixed, top 0, bottom 0, left 0 |
      | z-index       | 1000                         |
      | box-shadow    | 4px 0 16px rgba(0,0,0,0.10)  |

  @layout @sidebar
  Scenario: Sidebar Brand Header
    Given the sidebar is visible
    Then the top of the sidebar shows:
      | Element   | Description                                           |
      | Logo      | iServeU logo image, height 30px, white filter (brightness(0) invert(1)) |
      | Subtitle  | "Reconciliation Platform" in 9.5px uppercase text with 1px letter-spacing |
    And on mobile there is an X button to close the sidebar menu

  @layout @sidebar
  Scenario: Sidebar Navigation Items — Exactly 2 Modules
    Given the sidebar is visible
    Then the navigation section shows label "Navigation" in 10px uppercase at opacity 0.4
    And there are exactly 2 navigation items:
      | Nav Item            | Icon          | Active Tab Key |
      | Reconciliation Hub  | Zap (⚡)     | recon-hub      |
      | Job Archives        | HistoryIcon   | job-archives   |
    And each nav item has:
      | Property      | Value                                |
      | padding       | 9px 13px                             |
      | border-radius | 10px                                 |
      | font-size     | 13.5px                               |
      | color         | rgba(255,255,255,0.65)               |
    And the active nav item has background var(--primary), color white, font-weight 700
    And on hover nav items show white text with rgba(255,255,255,0.08) background

  @layout @sidebar
  Scenario: Sidebar Footer — User Info and Logout
    Given the sidebar is visible
    Then the sidebar footer shows:
      | Element          | Description                                       |
      | Avatar Circle    | 34px circle with rgba(255,255,255,0.1) background, User icon |
      | User Name        | Current user name in 12.5px white text             |
      | User Role        | Current user role in 10.5px at 50% white opacity   |
      | Logout Button    | "Logout Session" with LogOut icon in #ff8a8a color |
    And clicking "Logout Session" logs out the user and returns to the login page

  @layout @main
  Scenario: Main Content Area
    Given I am logged into the application
    Then the main content area has:
      | Property      | Value              |
      | margin-left   | 256px              |
      | padding       | 32px 44px          |
      | min-height    | 100vh              |
    And the header shows a dynamic title and subtitle based on the active tab:
      | Active Tab     | Title                                            | Subtitle                                                              |
      | recon-hub      | Reconciliation Hub Pipeline Execution            | Product Selection → NPCI Upload → Automated Report Fetching → Matched & Mismatched Output Reports. |
      | job-archives   | Job Archives & Historical Reconciliation Logs    | Inspect past reconciliation runs and re-download generated output files. |

  # ──────────────────────────────────────────────────────────────────────────
  # SECTION 4: RECONCILIATION HUB — FULL PIPELINE VIEW
  # ──────────────────────────────────────────────────────────────────────────

  @recon-hub @pipeline
  Scenario: Pipeline View Container
    Given I am on the "Reconciliation Hub" tab
    Then a glass-card container is displayed with 36px padding and fadeIn animation
    And the header shows:
      | Element   | Description                                         |
      | Icon      | Play icon in var(--primary) color, size 26           |
      | Title     | "Reconciliation Hub Execution Pipeline" at 26px, font-weight 800 |
      | Subtitle  | "Select Product, upload NPCI Report, auto-fetch report files, and generate Matched / Mismatched reconciliation reports." |

  @recon-hub @stepper
  Scenario: Horizontal Line-Tick Stepper Bar
    Given I am on the Reconciliation Hub
    Then a horizontal stepper bar is displayed with 4 steps connected by lines:
      | Step | Title                    | Description                      |
      | 1    | Product & Cycle          | Select Product, Date & Cycle     |
      | 2    | Upload NPCI Report       | Upload NPCI Settlement File      |
      | 3    | Auto-Fetch Reports       | Middleware, Switch & Wallet      |
      | 4    | Reconciliation Results   | Matched & Mismatched Reports     |
    And each step is represented by a circle (38px diameter) with the step number inside
    And steps are connected by horizontal lines (3px height) between circles
    And below each circle is the step title (12px, font-weight 700) and description (10.5px)

  @recon-hub @stepper
  Scenario: Stepper Circle States
    Given the horizontal stepper bar is visible
    Then each step circle has the following visual states:
      | State       | Background        | Border                     | Text/Icon                | Shadow                              |
      | Pending     | #e2e8f0           | 3px solid #e2e8f0          | Step number in #94a3b8   | none                                |
      | Active      | var(--primary)    | 3px solid var(--primary)   | Step number in white     | 0 0 0 4px rgba(17,157,176,0.15)     |
      | Processing  | var(--primary)    | 3px solid var(--primary)   | Spinning RefreshCw icon  | 0 0 0 4px rgba(17,157,176,0.15)     |
      | Completed   | var(--success)    | 3px solid var(--success)   | Check icon (✓) in white  | 0 0 0 4px rgba(16,185,129,0.15)     |
    And connecting lines turn green (var(--success)) when the preceding step is completed
    And connecting lines remain #e2e8f0 (gray) for incomplete transitions
    And all circle transitions animate over 0.35s ease
    And step title color is: green for completed, teal for active, text-secondary for pending

  # ──────────────────────────────────────────────────────────────────────────
  # STEP 1: PRODUCT, DATE & CYCLE SELECTION
  # ──────────────────────────────────────────────────────────────────────────

  @recon-hub @step1
  Scenario: Step 1 Panel — Product Card Grid
    Given I am on Step 1 of the pipeline
    Then the step panel shows:
      | Element   | Description                                    |
      | Title     | "Step 1: Select Product & Reconciliation Cycle" at 18px |
      | Subtitle  | "Choose your product, business date, and target reconciliation cycle." |
    And a section label "SELECT PRODUCT" in 12px uppercase, font-weight 700, text-secondary
    And 4 product cards are displayed in a 4-column grid with 14px gap:
      | Product | Emoji | Icon            | Subtitle                       | Brand Color |
      | UPI     | ⚡    | Zap             | Unified Payments Interface     | #119db0     |
      | DMT     | 💸    | ArrowRightLeft  | Direct Money Transfer          | #8b5cf6     |
      | AEPS    | 🖐️   | Fingerprint     | Aadhaar Enabled Payment        | #f59e0b     |
      | MATM    | 💳    | CreditCard      | Micro ATM                      | #ef4444     |

  @recon-hub @step1
  Scenario: Product Card Design and Selection Behavior
    Given the product card grid is displayed
    Then each product card has:
      | Property        | Inactive Value                | Active Value                              |
      | padding         | 22px 16px                     | 22px 16px                                 |
      | border-radius   | 16px                          | 16px                                      |
      | border          | 2px solid var(--border)       | 2.5px solid {product.color}               |
      | background      | white                         | {product.color}08 (8% opacity)            |
      | text-align      | center                        | center                                    |
      | transform       | none                          | translateY(-2px) (lifted)                 |
      | box-shadow      | none                          | 0 0 0 4px {color}15, 0 4px 14px {color}12 |
    And the active card shows a checkmark badge (24px circle) at top-right corner position (-8px, -8px):
      | Property   | Value                                  |
      | background | {product.color}                        |
      | content    | Check icon, 13px, white, strokeWidth 3 |
      | shadow     | 0 2px 8px {product.color}40            |
    And each card has a circular icon container (52px):
      | State    | Background            | Icon Color       |
      | Inactive | var(--bg-hover)       | #94a3b8          |
      | Active   | {product.color}18     | {product.color}  |
    And the title shows "{emoji} {product.id}" at 16px, font-weight 800
    And the subtitle shows the full product name at 11.5px, font-weight 600
    And clicking a card selects that product (default: UPI)

  @recon-hub @step1
  Scenario: Date and Cycle Selection Row
    Given I am on Step 1 of the pipeline
    Then below the product cards there is a 2-column grid (1fr 2fr) with 20px gap:
      | Field               | Type     | Label (uppercase)       | Default Value         |
      | Business Date       | date     | BUSINESS DATE           | Today's date (YYYY-MM-DD) |
      | Reconciliation Cycle| select   | RECONCILIATION CYCLE    | NPCI_Cycle_1          |
    And labels are 12px, uppercase, font-weight 700, text-secondary with 0.6px letter-spacing
    And inputs use settings-input class with 12px 14px padding

  @recon-hub @step1
  Scenario: NPCI Cycle Dropdown Options
    Given the Reconciliation Cycle dropdown is visible
    Then it contains 2 option groups:
      | Group                          | Options                                                |
      | NPCI Sub-Cycles (1 to 10)      | Cycles 1-10 with settlement cycle details and GEFU timing |
      | Internal Settlement Cycles     | Full Settlement Cycles 1-3 with GEFU processing times |
    And the NPCI cycle options follow this format:
      """
      NPCI Cycle {N} — Settlement Cycle {S} (Duration {start} to {end} | T Day/T+1 | GEFU {time})
      """
    And the specific NPCI cycles are:
      | Value          | Duration      | Settlement | GEFU Time |
      | NPCI_Cycle_1   | 21.00-00.00   | Cycle 1    | 09.30 AM  |
      | NPCI_Cycle_2   | 00.00-05.00   | Cycle 1    | 09.30 AM  |
      | NPCI_Cycle_3   | 05.00-07.00   | Cycle 1    | 09.30 AM  |
      | NPCI_Cycle_4   | 07.00-09.00   | Cycle 2    | 03.30 PM  |
      | NPCI_Cycle_5   | 09.00-11.00   | Cycle 2    | 03.30 PM  |
      | NPCI_Cycle_6   | 11.00-13.00   | Cycle 2    | 03.30 PM  |
      | NPCI_Cycle_7   | 13.00-15.00   | Cycle 3    | 09.30 PM  |
      | NPCI_Cycle_8   | 15.00-17.00   | Cycle 3    | 09.30 PM  |
      | NPCI_Cycle_9   | 17.00-19.00   | Cycle 1    | 09.30 AM  |
      | NPCI_Cycle_10  | 19.00-21.00   | Cycle 1    | 09.30 AM  |
    And the internal cycles are:
      | Value    | Label                                        |
      | Cycle_1  | Full Settlement Cycle 1 (09:30 AM GEFU Processing) |
      | Cycle_2  | Full Settlement Cycle 2 (03:30 PM GEFU Processing) |
      | Cycle_3  | Full Settlement Cycle 3 (09:30 PM GEFU Processing) |

  @recon-hub @step1
  Scenario: Proceed from Step 1 to Step 2
    Given I have selected a product, date, and cycle on Step 1
    When I click "Proceed to NPCI Upload" button (btn-primary with ChevronRight icon)
    Then Step 1 status changes to "Completed" (green checkmark in stepper)
    And the stepper line between Step 1 and Step 2 turns green
    And the current step advances to Step 2
    And the Step 2 panel is displayed

  # ──────────────────────────────────────────────────────────────────────────
  # STEP 2: UPLOAD NPCI REPORT
  # ──────────────────────────────────────────────────────────────────────────

  @recon-hub @step2
  Scenario: Step 2 Panel — NPCI File Upload Interface
    Given I am on Step 2 of the pipeline
    Then the step panel shows:
      | Element   | Description                                       |
      | Title     | "Step 2: Upload NPCI Report File" at 18px          |
      | Subtitle  | Shows selected product name in bold                |
    And a file upload dropzone is displayed with:
      | Property      | Value                                     |
      | border        | 2px dashed var(--border)                  |
      | border-radius | 16px                                      |
      | padding       | 36px                                      |
      | text-align    | center                                    |
      | background    | #F8FAFC                                   |
      | max-width     | 650px                                     |
    And the dropzone contains:
      | Element        | Description                                    |
      | Upload Icon    | Upload icon from lucide-react, size 36, teal   |
      | Title          | "Select NPCI Settlement Report" at 16px         |
      | Subtitle       | "Supported formats: .xlsx, .csv, .txt (Fixed Width / Delimited)" |
      | Browse Button  | "Browse Files" (btn-outline), triggers hidden file input |

  @recon-hub @step2
  Scenario: NPCI File Selection Feedback
    Given the upload dropzone is visible
    When I select a file using the "Browse Files" button
    Then a file info badge appears below the dropzone with:
      | Property   | Value                                              |
      | background | rgba(37,99,235,0.06)                               |
      | padding    | 10px 16px                                          |
      | border-radius | 10px                                            |
      | content    | FileText icon + "{filename} ({size} KB)"           |
      | color      | var(--primary)                                     |
      | font-weight| 700                                                |

  @recon-hub @step2
  Scenario: Upload Validation
    Given no NPCI file has been selected
    When I click "Upload & Start Auto-Fetch Sequence"
    Then an alert dialog appears with message "Please select an NPCI Report file to upload before proceeding."
    And the pipeline does not advance

  @recon-hub @step2
  Scenario: Upload and Proceed to Auto-Fetch
    Given an NPCI file has been selected
    When I click "Upload & Start Auto-Fetch Sequence" (btn-primary with Play icon)
    Then the button shows a spinning RefreshCw icon with text "Uploading File..."
    And the button is disabled during upload
    And after 1 second:
      | Action                                      |
      | Upload animation stops                      |
      | Step 2 status changes to "Completed"        |
      | Step 3 status changes to "Processing"       |
      | Current step advances to Step 3             |
      | Auto-fetch sequence starts automatically    |
    And a "Back" button (btn-outline) is available to return to Step 1

  # ──────────────────────────────────────────────────────────────────────────
  # STEP 3: AUTOMATED REPORT FETCHING
  # ──────────────────────────────────────────────────────────────────────────

  @recon-hub @step3
  Scenario: Step 3 Panel — Auto-Fetch Interface
    Given I am on Step 3 of the pipeline
    Then the step panel shows:
      | Element   | Description                                              |
      | Title     | "Step 3: Automated Report Fetching" at 18px               |
      | Subtitle  | "Fetching Middleware, Switch, and Wallet reports from GCP cloud infrastructure (2 seconds per report)." |
    And 3 report fetch boxes are displayed vertically (column layout, 16px gap, max-width 650px):
      | Report      | Icon     | Title                            | Subtitle                           |
      | Middleware  | Database | 1. Fetch Middleware Report (GCP)  | Retrieving raw transaction logs    |
      | Switch      | Server   | 2. Fetch Switch Report            | Retrieving core switch ledger data |
      | Wallet      | Wallet   | 3. Fetch Wallet Report            | Retrieving merchant wallet balances|

  @recon-hub @step3
  Scenario: Auto-Fetch Report Box Design
    Given the 3 report fetch boxes are displayed
    Then each fetch box has:
      | Property      | Value                        |
      | padding       | 18px 24px                    |
      | border-radius | 14px                         |
      | border        | 1px solid var(--border)      |
      | display       | flex, space-between, center  |
    And the active (currently fetching) box has background rgba(37,99,235,0.06)
    And inactive boxes have white background

  @recon-hub @step3
  Scenario: Sequential Auto-Fetch Animation (2 seconds each, no manual clicks)
    Given the auto-fetch sequence has started
    Then the following happens automatically without any user interaction:
      | Time (seconds) | Action                                                    | Middleware Box      | Switch Box       | Wallet Box       |
      | 0-2            | Fetching Middleware Report                                | Spinning + "Fetching (2s)..." badge (badge-primary) | "Waiting..." text | "Waiting..." text |
      | 2-4            | Middleware completed, Fetching Switch Report              | "✓ Completed" badge (badge-success) | Spinning + "Fetching (2s)..." | "Waiting..." text |
      | 4-6            | Switch completed, Fetching Wallet Report                  | "✓ Completed" badge | "✓ Completed" badge | Spinning + "Fetching (2s)..." |
      | 6+             | All completed, advance to Step 4                          | "✓ Completed" badge | "✓ Completed" badge | "✓ Completed" badge |
    And the spinning indicator uses RefreshCw icon with animate-spin class (0.85s linear infinite)
    And each "Fetching" badge shows a live countdown timer "(2s)..." → "(1s)..." → "(0s)..."
    And the countdown is implemented via a useEffect interval that decrements every 1000ms
    And after all 3 reports complete:
      | Action                                        |
      | Step 3 status changes to "Completed"          |
      | Step 4 status changes to "Processing"         |
      | Current step advances to Step 4               |
      | executeReconciliationEngine() is called        |

  # ──────────────────────────────────────────────────────────────────────────
  # STEP 4: RECONCILIATION RESULTS
  # ──────────────────────────────────────────────────────────────────────────

  @recon-hub @step4
  Scenario: Reconciliation Engine Execution
    Given Step 3 auto-fetch is complete
    Then the reconciliation engine executes:
      | Action                                                        |
      | Generates a Job ID: JOB-{product}-{timestamp}-{random4digit}  |
      | Sends POST to http://localhost:5000/api/recon/full-pipeline    |
      | Falls back to simulation data if backend is offline           |
    And the simulation generates 300 transactions:
      | Rule                    | Result     | Count |
      | Every 20th transaction  | Mismatched | 15    |
      | All others              | Matched    | 285   |
    And each simulated transaction has these fields:
      | Field           | Example Value                |
      | Transaction ID  | TXN_{product}_{i}            |
      | RRN             | 612345{i padded to 6 digits} |
      | Payer VPA       | user{i}@iserveu              |
      | Payee VPA       | merchant@iserveu             |
      | Amount          | 2500.00                      |
      | NPCI Status     | Success or Pending           |
      | Switch Status   | Success                      |
      | MW Status       | Success                      |
      | Wallet Status   | Success                      |
      | Status          | Matched or Mismatched        |
      | Label           | "Matched" or "Credit adjustment likely needed" |
      | Notes           | "" or "Pending response code in NPCI URCS"     |
    And the job is automatically saved to localStorage via saveJobToHistory()

  @recon-hub @step4
  Scenario: Step 4 Results Header
    Given the reconciliation engine has completed
    Then the results panel shows:
      | Element           | Description                                          |
      | Success Icon      | CheckCircle in var(--success), size 20                |
      | Title             | "Reconciliation Execution Completed" at 18px          |
      | Info Line         | "Date: {date} | Cycle: {cycle with spaces} | Time: {HH:MM:SS AM/PM} | Product: {product}" |
    And 2 download buttons are displayed:
      | Button                            | Style                              |
      | Download Matched Report (.xlsx)   | btn-primary, Download icon         |
      | Download Mismatched Report (.xlsx) | btn-outline, warning border/color, Download icon |

  @recon-hub @step4
  Scenario: Results Summary Badges (3-column grid)
    Given the results are displayed
    Then a 3-column grid shows summary cards with 16px gap:
      | Card                    | Background             | Border Color      | Value Color      |
      | Total Processed         | #F8FAFC                | var(--border)     | default          |
      | Matched Transactions    | rgba(34,197,94,0.06)   | var(--success)    | var(--success)   |
      | Mismatched Transactions | rgba(239,68,68,0.06)   | var(--danger)     | var(--danger)    |
    And each card shows:
      | Element  | Style                                    |
      | Label    | 12px uppercase, font-weight 700          |
      | Count    | 22px font-size, margin-top 4px           |
    And "Total Processed" shows matchedList.length + mismatchedList.length

  @recon-hub @step4
  Scenario: Tabular Reports Inspector
    Given the results are displayed
    Then a tabbed data table inspector is shown with:
      | Element      | Description                                      |
      | Container    | 1px border, 16px border-radius, overflow hidden   |
      | Tab Bar      | #F8FAFC background, flex row with 2 tab buttons   |
      | Search Input | 280px width with Search icon, searches by TXN ID/RRN/VPA |
    And 2 tab buttons:
      | Tab                     | Shows Count                |
      | Matched Transactions    | (result.matchedList.length)   |
      | Mismatched Transactions | (result.mismatchedList.length) |
    And the active tab uses btn-primary style, inactive uses btn-outline

  @recon-hub @step4
  Scenario: Data Table Columns and Rendering
    Given the results table is displayed
    Then the table has the following columns:
      | Column          | Style Notes                                |
      | Transaction ID  | font-weight 700, monospace font             |
      | RRN             | monospace font                              |
      | Payer VPA       | default                                    |
      | Payee VPA       | default                                    |
      | Amount          | font-weight 700, prefixed with ₹           |
      | NPCI Status     | badge-success                              |
      | Switch Status   | badge-success                              |
      | MW Status       | badge-success                              |
      | Wallet Status   | badge-success                              |
      | Status / Label  | badge-success for Matched, badge-warning for Mismatched |
    And when the "Mismatched" tab is active, an additional column appears:
      | Column            | Style                                |
      | Discrepancy Notes | color var(--danger), font-weight 600 |
    And the table has max-height 420px with overflow-x auto scrolling
    And rows are searchable/filterable by the search input above

  @recon-hub @step4
  Scenario: Download Matched Transactions Report
    Given the results are displayed
    When I click "Download Matched Report (.xlsx)"
    Then an Excel file is downloaded with filename "Matched_Transactions_Report_{jobId}.xlsx"
    And the sheet is named "Matched_Transactions"
    And the columns are: Transaction ID, RRN, Payer VPA, Payee VPA, Amount, NPCI Status, Switch Status, MW Status, Wallet Status, Status

  @recon-hub @step4
  Scenario: Download Mismatched Transactions Report
    Given the results are displayed
    When I click "Download Mismatched Report (.xlsx)"
    Then an Excel file is downloaded with filename "Mismatched_Transactions_Report_{jobId}.xlsx"
    And the sheet is named "Mismatched_Transactions"
    And the columns are: Transaction ID, RRN, Payer VPA, Payee VPA, Amount, NPCI Status, Switch Status, MW Status, Wallet Status, Label, Notes

  @recon-hub @step4
  Scenario: Run Another Reconciliation
    Given the results are displayed on Step 4
    Then a "Run Another Reconciliation" button (btn-outline) is displayed at bottom-right
    When I click "Run Another Reconciliation"
    Then:
      | Action                                    |
      | Step statuses reset: Step 1=Completed, Steps 2-4=Pending |
      | Current step returns to Step 1            |
      | NPCI file selection is cleared            |
      | Previous results are cleared              |

  # ──────────────────────────────────────────────────────────────────────────
  # SECTION 5: JOB ARCHIVES
  # ──────────────────────────────────────────────────────────────────────────

  @job-archives
  Scenario: Job Archives Page Layout
    Given I click "Job Archives" in the sidebar
    Then a glass-card container is displayed with 36px padding and fadeIn animation
    And the header shows:
      | Element   | Description                                         |
      | Icon      | HistoryIcon in var(--primary), size 26               |
      | Title     | "Job Archives & Reconciliation History" at 26px      |
      | Subtitle  | "Inspect past reconciliation runs and re-download all 6 generated output files." |

  @job-archives @filters
  Scenario: Filter Bar — Date and Cycle Filters
    Given I am on the Job Archives page
    Then a filter bar is displayed with:
      | Property      | Value                        |
      | display       | flex, align-items flex-end   |
      | gap           | 16px                         |
      | padding       | 18px 22px                    |
      | background    | var(--bg-hover)              |
      | border-radius | 14px                         |
      | border        | 1px solid var(--border)      |
    And the filter bar contains:
      | Element          | Type    | Label (uppercase)   | Width    | Details                     |
      | Filter Icon      | icon    | —                   | 18px     | Filter icon in teal         |
      | Date Filter      | date    | FILTER BY DATE      | 180px    | Calendar icon in label      |
      | Cycle Filter     | select  | FILTER BY CYCLE     | 240px    | Clock icon in label         |
    And the Cycle dropdown shows "All Cycles" as default plus dynamically populated unique cycles from stored jobs
    And cycle option labels replace underscores with spaces for readability

  @job-archives @filters
  Scenario: Clear Filters Button
    Given I have set a date or cycle filter
    Then a "Clear Filters" button (btn-outline with X icon) appears in the filter bar
    When I click "Clear Filters"
    Then both date and cycle filters are reset to empty/default
    And the button disappears

  @job-archives @filters
  Scenario: Results Count Display
    Given the filter bar is visible
    Then the right side of the filter bar shows "{filtered count} of {total count} jobs"
    And the text is 13px, text-secondary color, font-weight 600

  @job-archives @filters
  Scenario: Empty State
    Given no jobs match the selected filters
    Then an empty state message is shown:
      | Property      | Value                                            |
      | padding       | 40px                                             |
      | text-align    | center                                           |
      | background    | var(--bg-hover)                                  |
      | border-radius | 16px                                             |
      | message       | "No reconciliation jobs found matching your filters." |

  @job-archives @job-cards
  Scenario: Job Card — Collapsed Summary View
    Given there are stored jobs in localStorage
    Then each job is displayed as a card with:
      | Property      | Value                               |
      | background    | white                               |
      | border-radius | 18px                                |
      | border        | 1px solid var(--border)             |
    And the collapsed card shows:
      | Element               | Description                                    |
      | Tag Icon              | 44px square icon container with Tag icon, teal |
      | Job ID                | 17px monospace, font-weight 800                |
      | Status Badge          | "✓ COMPLETED" badge-success                    |
      | Date & Time           | Calendar icon + "{date} ({time})"              |
      | Cycle                 | Clock icon + "{cycle}"                         |
      | Matched / Exceptions  | Green matched count / Red mismatched count (match rate) |
      | Net Settlement        | "₹{amount}" in var(--primary)                  |
      | Expand Button         | "Inspect & Download Files" (btn-outline) with ChevronDown |
    And clicking the card toggles the expanded state
    And the expanded card header has background var(--bg-hover)

  @job-archives @job-cards
  Scenario: Job Card — Expanded Downloads Panel
    Given I click on a job card to expand it
    Then an expanded panel slides open below the card summary with:
      | Property      | Value                           |
      | padding       | 24px                            |
      | border-top    | 1px solid var(--border)         |
      | background    | #F8FAFC                         |
    And a section label "Available Output Downloads for {jobId}" in 13px uppercase
    And exactly 2 download buttons in a 2-column grid with 14px gap:
      | Download Button               | Icon          | Icon Color       | Subtitle           |
      | Matched Transactions Report   | CheckCircle2  | var(--success)   | .XLSX Excel Sheet  |
      | Mismatched Transactions Report| AlertCircle   | var(--danger)    | .XLSX Excel Sheet  |
    And each button uses btn-outline style with white background, 12px border-radius
    And the expand button text changes to "Hide Downloads" with ChevronUp icon

  @job-archives
  Scenario: Collapsing a Job Card
    Given a job card is expanded
    When I click the job card header or "Hide Downloads" button
    Then the downloads panel collapses
    And only one job card can be expanded at a time

  # ──────────────────────────────────────────────────────────────────────────
  # SECTION 6: DATA PERSISTENCE & STORAGE
  # ──────────────────────────────────────────────────────────────────────────

  @data @storage
  Scenario: Job History — localStorage Persistence
    Given a reconciliation job is completed in the pipeline
    Then the job is saved to localStorage under key "isu_recon_job_history"
    And the saved job object contains:
      | Field                 | Type     | Description                          |
      | jobId                 | string   | JOB-{product}-{timestamp}-{random}   |
      | product               | string   | UPI, DMT, AEPS, or MATM              |
      | date                  | string   | Selected business date (YYYY-MM-DD)  |
      | time                  | string   | Execution time (HH:MM AM/PM)         |
      | cycle                 | string   | Selected cycle identifier            |
      | status                | string   | "COMPLETED"                          |
      | matchedCount          | number   | Count of matched transactions        |
      | mismatchedCount       | number   | Count of mismatched transactions     |
      | matchedList           | array    | Full matched transaction data        |
      | mismatchedList        | array    | Full mismatched transaction data     |
      | gefuFlatFileContent   | string   | GEFU flat file text content          |
      | gefuAccountingLedger  | array    | GEFU accounting ledger entries       |
      | settlementRows        | array    | Settlement calculation rows          |
      | payoutRows            | array    | Payout instruction rows              |
    And getStoredJobs() retrieves all jobs from localStorage for the Job Archives page

  @data @storage
  Scenario: Fee Configuration Store
    Given the reconciliation engine needs fee configuration
    Then getFeeConfig() returns fee parameters from localStorage (or defaults)
    And the fee configuration includes:
      | Parameter            | Purpose                               |
      | bankShareRate        | Bank share percentage of gross amount  |
      | interchangeRate      | Interchange fee percentage             |
      | switchingFeePerTxn   | Per-transaction switching fee          |
      | impsPayoutMaxLimit   | Maximum payout limit per transaction (default ₹500,000) |

  # ──────────────────────────────────────────────────────────────────────────
  # SECTION 7: EXCEL EXPORT UTILITIES
  # ──────────────────────────────────────────────────────────────────────────

  @export @excel
  Scenario: Multi-Sheet Excel Export
    Given I click any download button (Matched or Mismatched report)
    Then the exportMultiSheetExcel utility creates an XLSX file with:
      | Feature            | Description                              |
      | Multiple Sheets    | Each sheet has a name, column headers, and data rows |
      | Auto Column Width  | Columns are sized to fit content          |
      | Download Trigger   | File is downloaded via browser Blob/URL mechanism |
    And the file is named with the pattern "{ReportType}_Report_{jobId}.xlsx"

  # ──────────────────────────────────────────────────────────────────────────
  # SECTION 8: BACKEND API CONTRACT
  # ──────────────────────────────────────────────────────────────────────────

  @api @backend
  Scenario: Full Pipeline API Endpoint
    Given the reconciliation engine executes
    Then it sends a POST request to "http://localhost:5000/api/recon/full-pipeline"
    And the request body contains:
      | Field      | Type   | Description                  |
      | jobId      | string | Generated Job ID             |
      | product    | string | Selected product             |
      | cycle      | string | Selected reconciliation cycle|
      | date       | string | Selected business date       |
      | feeConfig  | object | Fee configuration parameters |
    And the expected response structure is:
      | Field                | Type   | Description                    |
      | results.jobId        | string | Confirmed Job ID               |
      | results.matchedList  | array  | Matched transaction records    |
      | results.mismatchedList| array | Mismatched transaction records |
      | results.gefuFlatFileContent | string | GEFU file content       |
      | results.gefuAccountingLedger| array  | Accounting entries      |
      | results.settlementRows     | array  | Settlement calculations  |
      | results.payoutRows         | array  | Payout instructions      |
    And if the backend is offline, the frontend generates simulation data with 300 transactions

  # ──────────────────────────────────────────────────────────────────────────
  # SECTION 9: TECHNOLOGY STACK & PROJECT STRUCTURE
  # ──────────────────────────────────────────────────────────────────────────

  @tech-stack
  Scenario: Technology Stack
    Given this is a web application
    Then the following technologies are used:
      | Technology    | Version/Details                          |
      | React         | 18.x with JSX                            |
      | Vite          | Build tool and dev server                |
      | Lucide React  | Icon library (lucide-react)              |
      | Axios         | HTTP client for API calls                |
      | XLSX/SheetJS  | Excel file generation and export         |
      | CSS           | Vanilla CSS with CSS custom properties   |
      | Font          | Poppins from Google Fonts                |
      | Storage       | Browser localStorage for persistence     |

  @tech-stack @structure
  Scenario: Project File Structure
    Given the project is structured as follows:
      """
      src/
      ├── main.jsx                           # React entry point, renders App
      ├── App.jsx                            # Root component: sidebar + routing
      ├── App.css                            # App-specific styles
      ├── index.css                          # Global design system styles
      ├── theme.css                          # CSS custom properties / variables
      ├── fonts.css                          # Google Fonts import (Poppins)
      ├── components/
      │   ├── Login.jsx                      # Login screen with role selection
      │   ├── FullPipelineView.jsx           # 4-step reconciliation pipeline
      │   └── History.jsx                    # Job Archives with date/cycle filters
      └── utils/
          ├── jobHistoryStore.js             # localStorage CRUD for job history
          ├── excelWorkbookExporter.js       # Multi-sheet XLSX export utility
          ├── excelExporter.js               # Single-sheet XLSX export utility
          └── feeConfigStore.js              # Fee configuration persistence
      index.html                             # HTML entry point
      package.json                           # Dependencies and scripts
      vite.config.js                         # Vite configuration
      """

  @tech-stack @routing
  Scenario: Client-Side Tab Routing
    Given the application uses state-based tab routing (no URL router)
    Then the activeTab state controls which component is rendered:
      | activeTab Value | Component Rendered | Description          |
      | recon-hub       | FullPipelineView   | Reconciliation Hub   |
      | job-archives    | HistoryLog         | Job Archives         |
    And the default activeTab on login is "recon-hub"
    And clicking sidebar nav items updates activeTab and closes mobile menu

  # ──────────────────────────────────────────────────────────────────────────
  # SECTION 10: COMPLETE USER FLOW (END-TO-END)
  # ──────────────────────────────────────────────────────────────────────────

  @e2e @flow
  Scenario: Complete End-to-End Reconciliation Flow
    Given I open the application
    # Login
    When I select "Finance Admin" role and click "Sign In"
    Then I see a loading spinner for 1.2 seconds and enter the main application

    # Step 1: Product & Cycle Selection
    Given I am on the Reconciliation Hub
    When I click the "DMT" product card
    Then the DMT card shows a purple border, lift effect, and checkmark badge
    When I select date "2026-07-23" and cycle "NPCI_Cycle_4"
    And I click "Proceed to NPCI Upload"
    Then Step 1 circle shows green checkmark, line turns green, Step 2 becomes active

    # Step 2: NPCI Upload
    When I click "Browse Files" and select "npci_settlement_july.csv"
    Then the file info badge shows "npci_settlement_july.csv (245.3 KB)"
    When I click "Upload & Start Auto-Fetch Sequence"
    Then the button shows spinning animation for 1 second

    # Step 3: Auto-Fetch (automatic, no user action needed)
    Then Middleware report auto-fetches with 2-second countdown animation
    Then Switch report auto-fetches with 2-second countdown animation
    Then Wallet report auto-fetches with 2-second countdown animation
    And all 3 report boxes show "✓ Completed" badges

    # Step 4: Results
    Then the results panel appears with:
      | Total Processed | 300 |
      | Matched         | 285 |
      | Mismatched      | 15  |
    And I can switch between "Matched Transactions" and "Mismatched Transactions" tabs
    And I can search transactions by Transaction ID, RRN, or VPA
    And I can download Matched Report and Mismatched Report as .xlsx files
    And the info line shows "Date: 2026-07-23 | Cycle: NPCI Cycle 4 | Time: 05:15:30 PM | Product: DMT"

    # Job Archives Verification
    When I click "Job Archives" in the sidebar
    Then I see the completed job card with DMT product details
    When I filter by date "2026-07-23"
    Then only jobs from that date are shown
    When I expand the job card
    Then I see 2 download buttons: Matched Report and Mismatched Report
    When I click "Clear Filters"
    Then all jobs are shown again
