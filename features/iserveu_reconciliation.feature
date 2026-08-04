# language: en
@iserveu @recon @specification @master
Feature: iServeU Reconciliation Platform
              As a Finance Administrator
              I want a category-wise product specification mapping all 12 main product categories and sub-products.
        Background:
            Given the iServeU Reconciliation Platform web services are running
              And the session user is authenticated as "Finance Admin"

  # ===========================================================================
  # SECTION 1: AUTHENTICATION & PORTAL SHELL SPECIFICATION
  # ===========================================================================

        @auth
        Scenario Outline: Authenticate session with single Finance Admin role
            Given the user opens the portal login page
             When the user enters Username "<Username>" and Password "<Password>"
              And selects access role "Finance Admin" with description "Audit, Report & Verify"
              And clicks the "Sign In" button
             Then the application authenticates credentials and grants session access as "<Role>"
              And redirects to default workspace module

        Examples:
                  | Username         | Password   | Role          |
                  | admin@iserveu.in | admin@2026 | Finance Admin |

        @auth @user_menu
        Scenario: Header profile menu controls
            Given the user is authenticated as "Finance Admin"
             When the user clicks the profile avatar in the header
             Then the dropdown menu displays simple action buttons "Forgot Password" and "Logout" without descriptive text

        @shell
        Scenario Outline: Render sidebar navigation and dynamic workspace header
            Given the user is authenticated and viewing the application shell
             Then the left sidebar renders at fixed 260px width with dark navy background
              And the navigation menu presents menu items "Product Recon" and "Report"
             When the user clicks navigation menu item "<TargetTab>"
             Then the main workspace header title updates to "<HeaderTitle>"

        Examples:
                  | TargetTab     | HeaderTitle                             |
                  | product-recon | Product Reconciliation Engine           |
                  | job-archives  | Reconciliation Report & Historical Logs |

  # ===========================================================================
  # SECTION 2: CATEGORY-WISE SEQUENTIAL 6-STEP WIZARD SPECIFICATIONS
  # ===========================================================================

        @wizard @vertical_selection
        Scenario Outline: Step 1 presents 3 core business verticals with grouped product categories
            Given the user is on Step 1 "Category Selection"
             Then the page presents 3 main options: "Agency Banking", "Acquiring", and "BBPS"
             When the user selects business vertical "<VerticalName>"
             Then the product categories under "<VerticalName>" are displayed as "<ProductList>"

        Examples:
                  | VerticalName   | ProductList                                                                    |
                  | Agency Banking | AEPS, MATM, DMT, RECHARGE, PREPAID CARD                                        |
                  | Acquiring      | UPI, IMPS, POS / Cashpoint, RBL CASHOUT/PAYOUT, WALLET RECON, COMMISSION RECON |
                  | BBPS           | BBPS                                                                           |

  # ---------------------------------------------------------------------------
  # Category Workflow Execution: AEPS
  # ---------------------------------------------------------------------------
        @wizard @category_aeps
        Scenario Outline: Sequential 6-step wizard execution for AEPS sub-products
            Given the user selects category "AEPS" on Step 1 "Category Selection"
             When the user selects sub-product "<SubProductName>" on Step 2
             Then the wizard advances to Step 3 "Date & Settlement Cycle Configuration"
              And the user selects Business Date "2026-07-28" and Settlement Cycle "Cycle 1"
             When the user proceeds to Step 4 "Per-File Collection"
             Then the system configures required source file count as <RequiredFilesCount>
              And specifies required input source files as "<RequiredFileNames>"
              And internal files will auto fetch from bucket for <RequiredFileNames>
              And bank files are collected via upload
             When bank files are uploaded on Step 4
             Then internal files auto fetch from bucket
              And reconciliation engine automatically initiates for <SubProductName>
             Then an initiation modal appears stating "Reconciliation process for <SubProductName> (2026-07-28 — Cycle 1 (00:00 - 08:00 Window)) has been initiated. Completed results are available in the Report section." without timer countdown
              And presents action buttons "Start New Reconciliation" and "View in Report Section"
             When the user views the results on Step 6
             Then Step 6 renders heading "Reconciliation Results & Reports" with KPI summary metrics, and "matching file" and "mismatched file" reports are available to download

        Examples:
                  | SubProductName       | RequiredFilesCount | RequiredFileNames                          | JoinColumn        | MatchingRule                      | MismatchingRule                       |
                  | Aadharpay            | 3                  | Middleware, Switch, NPCI Settlement        | Client_Txn_Id     | Status=SUCCESS & Amount Equal     | Status!=SUCCESS / Amount Variance     |
                  | Fino AEPS            | 3                  | Gateway, Internal Ledger, Fino Bank CBS    | Client_Txn_Id     | Status=SUCCESS & Amount Equal     | Status!=SUCCESS / Amount Variance     |
                  | NSDL AEPS            | 4                  | Middleware, Switch, NPCI, NSDL Bank CBS    | RRN               | Status=SUCCESS & Amount Equal     | Status!=SUCCESS / Amount Variance     |
                  | IPPB AEPS            | 3                  | Middleware, Switch, Core Banking           | RRN, relationalId | Status=SUCCESS & Amount Equal     | Status!=SUCCESS / Amount Variance     |
                  | IPPB AEPS CD         | 2                  | Cash Deposit Gateway, CD Bank Statement    | Client_Txn_Id     | Status=SUCCESS & Amount Equal     | Status!=SUCCESS / Amount Variance     |
                  | IPPB Wallet          | 2                  | Wallet Switch, Wallet Clearing             | relationalId      | Status=SUCCESS & Amount Equal     | Status!=SUCCESS / Amount Variance     |

  # ---------------------------------------------------------------------------
  # Category Workflow Execution: MATM
  # ---------------------------------------------------------------------------
        @wizard @category_matm
        Scenario Outline: Sequential 6-step wizard execution for MATM sub-products
            Given the user selects category "MATM" on Step 1 "Category Selection"
             When the user selects sub-product "<SubProductName>" on Step 2
             Then the wizard advances to Step 3 "Date & Settlement Cycle Configuration"
              And the user selects Business Date "2026-07-28" and Settlement Cycle "Cycle 1"
             When the user proceeds to Step 4 "Per-File Collection"
             Then the system configures required source file count as <RequiredFilesCount>
              And specifies required input source files as "<RequiredFileNames>"
              And internal files will auto fetch from bucket for <RequiredFileNames>
              And bank files are collected via upload
             When bank files are uploaded on Step 4
             Then internal files auto fetch from bucket
              And reconciliation engine automatically initiates for <SubProductName>
             Then the processing engine joins source files on column "<JoinColumn>" using matching rule "<MatchingRule>"
              And identifies exception records using mismatching rule "<MismatchingRule>"
              And Step 6 renders heading "Reconciliation Results & Reports" with KPI summary metrics and downloadable reports

        Examples:
                  | SubProductName        | RequiredFilesCount | RequiredFileNames                                 | JoinColumn        | MatchingRule                      | MismatchingRule                       |
                  | MATM 4-Way Txn Recon  | 4                  | Middleware, Terminal Batch, Switch, Acquiring Bank | RRN               | Status=SUCCESS & Amount Equal     | Status!=SUCCESS / Amount Variance     |
                  | MATM 3-Way Txn Recon  | 3                  | Middleware Journal, Switch Log, Bank Settlement   | RRN               | Status=SUCCESS & Amount Equal     | Status!=SUCCESS / Amount Variance     |
                  | MATM Commission Recon | 2                  | Commission Engine Log, Agent Commission Ledger    | relationalId      | Status=SUCCESS & Commission Equal | Status!=SUCCESS / Commission Variance |
                  | Equitas MATM          | 2                  | Equitas Gateway Log, Small Finance Bank CBS       | RRN, apiTid       | Status=SUCCESS & Amount Equal     | Status!=SUCCESS / Amount Variance     |
                  | NSDL MATM             | 2                  | MicroATM Switch, Payments Bank Settlement         | RRN, Id           | Status=SUCCESS & Amount Equal     | Status!=SUCCESS / Amount Variance     |
                  | IPPB MATM             | 2                  | MicroATM Gateway Log, Host Clearing Report        | RRN, relationalId | Status=SUCCESS & Amount Equal     | Status!=SUCCESS / Amount Variance     |

  # ---------------------------------------------------------------------------
  # Category Workflow Execution: IMPS
  # ---------------------------------------------------------------------------
        @wizard @category_imps
        Scenario Outline: Sequential 6-step wizard execution for IMPS sub-products
            Given the user selects category "IMPS" on Step 1 "Category Selection"
             When the user selects sub-product "<SubProductName>" on Step 2
             Then the wizard advances to Step 3 "Date & Settlement Cycle Configuration"
              And the user selects Business Date "2026-07-28" and Settlement Cycle "Cycle 1"
             When the user proceeds to Step 4 "Per-File Collection"
             Then the system configures required source file count as <RequiredFilesCount>
              And specifies required input source files as "<RequiredFileNames>"
              And internal files will auto fetch from bucket for <RequiredFileNames>
              And bank files are collected via upload
             When bank files are uploaded on Step 4
             Then internal files auto fetch from bucket
              And reconciliation engine automatically initiates for <SubProductName>
             Then the processing engine joins source files on column "<JoinColumn>" using matching rule "<MatchingRule>"
              And identifies exception records using mismatching rule "<MismatchingRule>"
              And Step 6 renders heading "Reconciliation Results & Reports" with KPI summary metrics and downloadable reports

        Examples:
                  | SubProductName | RequiredFilesCount | RequiredFileNames                                    | JoinColumn | MatchingRule                                 | MismatchingRule                                          |
                  | NSDL IMPS      | 3                  | IMPS Middleware Log, IMPS Switch Journal, NSDL CBS   | RRN        | Status=SUCCESS & Amount Equal across 3 Files | Status!=SUCCESS / RET Code -> Callback API Refund Wallet |
                  | IPPB IMPS      | 2                  | IPPB IMPS Switch Log, IPPB Settlement Report         | RRN        | Status=SUCCESS & Amount Equal across 2 Files | Status!=SUCCESS / RET Code -> Callback API Refund Wallet |

  # ---------------------------------------------------------------------------
  # Category Workflow Execution: BBPS
  # ---------------------------------------------------------------------------
        @wizard @category_bbps
        Scenario Outline: Sequential 6-step wizard execution for BBPS sub-products
            Given the user selects category "BBPS" on Step 1 "Category Selection"
             When the user selects sub-product "<SubProductName>" on Step 2
             Then the wizard advances to Step 3 "Date & Settlement Cycle Configuration"
              And the user selects Business Date "2026-07-28" and Settlement Cycle "Cycle 1"
             When the user proceeds to Step 4 "Per-File Collection"
             Then the system configures required source file count as <RequiredFilesCount>
              And specifies required input source files as "<RequiredFileNames>"
              And internal files will auto fetch from bucket for <RequiredFileNames>
              And bank files are collected via upload
             When bank files are uploaded on Step 4
             Then internal files auto fetch from bucket
              And reconciliation engine automatically initiates for <SubProductName>
             Then the processing engine joins source files on column "<JoinColumn>" using matching rule "<MatchingRule>"
              And identifies exception records using mismatching rule "<MismatchingRule>"
              And Step 6 renders heading "Reconciliation Results & Reports" with KPI summary metrics and downloadable reports

        Examples:
                  | SubProductName                          | RequiredFilesCount | RequiredFileNames                             | JoinColumn    | MatchingRule                  | MismatchingRule                   |
                  | BBPS COU (Bank of Baroda / BB11)        | 2                  | BOB BB11 COU Gateway, BOB BBPS Settlement     | TxnRefID      | Status=SUCCESS & Amount Equal | Status!=SUCCESS / Amount Variance |
                  | BBPS BOU Reconciliation                 | 2                  | BOU Outlet Gateway Log, NPCI BBPS Settlement  | TxnRefID      | Status=SUCCESS & Amount Equal | Status!=SUCCESS / Amount Variance |
                  | NSDL BBPS                               | 2                  | NSDL BBPS Switch Log, NSDL Bank Cleared File  | Client_Txn_Id | Status=SUCCESS & Amount Equal | Status!=SUCCESS / Amount Variance |
                  | IPPB BBPS                               | 2                  | IPPB Bill Pay Switch, IPPB Settlement Statement| RRN          | Status=SUCCESS & Amount Equal | Status!=SUCCESS / Amount Variance |

  # ---------------------------------------------------------------------------
  # Category Workflow Execution: RECHARGE
  # ---------------------------------------------------------------------------
        @wizard @category_recharge
        Scenario Outline: Sequential 6-step wizard execution for RECHARGE sub-products
            Given the user selects category "RECHARGE" on Step 1 "Category Selection"
             When the user selects sub-product "<SubProductName>" on Step 2
             Then the wizard advances to Step 3 "Date & Settlement Cycle Configuration"
              And the user selects Business Date "2026-07-28" and Settlement Cycle "Cycle 1"
             When the user proceeds to Step 4 "Per-File Collection"
             Then the system configures required source file count as <RequiredFilesCount>
              And specifies required input source files as "<RequiredFileNames>"
              And internal files will auto fetch from bucket for <RequiredFileNames>
              And bank files are collected via upload
             When bank files are uploaded on Step 4
             Then internal files auto fetch from bucket
              And reconciliation engine automatically initiates for <SubProductName>
             Then the processing engine joins source files on column "<JoinColumn>" using matching rule "<MatchingRule>"
              And identifies exception records using mismatching rule "<MismatchingRule>"
              And Step 6 renders heading "Reconciliation Results & Reports" with KPI summary metrics and downloadable reports

        Examples:
                  | SubProductName                            | RequiredFilesCount | RequiredFileNames                                          | JoinColumn      | MatchingRule                      | MismatchingRule                       |
                  | Recharge Krack                            | 2                  | Recharge Krack Switch Log, Operator Recon Sheet            | Operator_Txn_Id | Status=SUCCESS & Amount Equal     | Status!=SUCCESS / Amount Variance     |
                  | Recharge Euro                             | 2                  | Euronet Recharge Gateway, Euronet Aggregator Clearing      | Operator_Txn_Id | Status=SUCCESS & Amount Equal     | Status!=SUCCESS / Amount Variance     |
                  | Recharge Commission Recon (Krac & Euronet)| 2                  | Telecom Commission Log, Aggregator Margin Statement        | Txn_Id          | Status=SUCCESS & Commission Equal | Status!=SUCCESS / Commission Variance |

  # ---------------------------------------------------------------------------
  # Category Workflow Execution: UPI
  # ---------------------------------------------------------------------------
        @wizard @category_upi
        Scenario Outline: Sequential 6-step wizard execution for UPI sub-products
            Given the user selects category "UPI" on Step 1 "Category Selection"
             When the user selects sub-product "<SubProductName>" on Step 2
             Then the wizard advances to Step 3 "Date & Settlement Cycle Configuration"
              And the user selects Business Date "2026-07-28" and Settlement Cycle "Cycle 1"
             When the user proceeds to Step 4 "Per-File Collection"
             Then the system configures required source file count as <RequiredFilesCount>
              And specifies required input source files as "<RequiredFileNames>"
              And internal files will auto fetch from bucket for <RequiredFileNames>
              And bank files are collected via upload
             When bank files are uploaded on Step 4
             Then internal files auto fetch from bucket
              And reconciliation engine automatically initiates for <SubProductName>
             Then the processing engine joins source files on column "<JoinColumn>" using matching rule "<MatchingRule>"
              And identifies exception records using mismatching rule "<MismatchingRule>"
              And Step 6 renders heading "Reconciliation Results & Reports" with KPI summary metrics and downloadable reports

        Examples:
                  | SubProductName                                      | RequiredFilesCount | RequiredFileNames                                   | JoinColumn                                                    | MatchingRule                                                  | MismatchingRule                                                            |
                  | NSDL MA UPI (UPI Transaction Reconciliation)        | 4                  | NPCI File, Middleware File, Switch File, Wallet File| Switch txn_id / client ref_id / id / txn_id / RRN / payer_vpa | Status=SUCCESS & Settlement Amount/100 Equal across 4 Systems | Status!=SUCCESS / Amount Variance -> Manual Review & Middleware Adjustment |
                  | Oxymoney UPI (UPI Transaction Reconciliation)       | 4                  | NPCI File, Middleware File, Switch File, Wallet File| Switch txn_id / client ref_id / id / txn_id / RRN / payer_vpa | Status=SUCCESS & Settlement Amount/100 Equal across 4 Systems | Status!=SUCCESS / Amount Variance -> Manual Review & Middleware Adjustment |
                  | KHATA BOOK PA/PG UPI (UPI Transaction Reconciliation)| 4                  | NPCI File, Middleware File, Switch File, Wallet File| Switch txn_id / client ref_id / id / txn_id / RRN / payer_vpa | Status=SUCCESS & Settlement Amount/100 Equal across 4 Systems | Status!=SUCCESS / Amount Variance -> Manual Review & Middleware Adjustment |

  # ---------------------------------------------------------------------------
  # Category Workflow Execution: DMT
  # ---------------------------------------------------------------------------
        @wizard @category_dmt
        Scenario Outline: Sequential 6-step wizard execution for DMT sub-products
            Given the user selects category "DMT" on Step 1 "Category Selection"
             When the user selects sub-product "<SubProductName>" on Step 2
             Then the wizard advances to Step 3 "Date & Settlement Cycle Configuration"
              And the user selects Business Date "2026-07-28" and Settlement Cycle "Cycle 1"
             When the user proceeds to Step 4 "Per-File Collection"
             Then the system configures required source file count as <RequiredFilesCount>
              And specifies required input source files as "<RequiredFileNames>"
              And internal files will auto fetch from bucket for <RequiredFileNames>
              And bank files are collected via upload
             When bank files are uploaded on Step 4
             Then internal files auto fetch from bucket
              And reconciliation engine automatically initiates for <SubProductName>
             Then the processing engine joins source files on column "<JoinColumn>" using matching rule "<MatchingRule>"
              And identifies exception records using mismatching rule "<MismatchingRule>"
              And Step 6 renders heading "Reconciliation Results & Reports" with KPI summary metrics and downloadable reports

        Examples:
                  | SubProductName | RequiredFilesCount | RequiredFileNames                             | JoinColumn                        | MatchingRule                                 | MismatchingRule                   |
                  | Airtel DMT     | 2                  | Airtel DMT Switch Log, Airtel Payment Bank    | RRN (Step 1) / gatewayId (Step 2) | Status=SUCCESS & Amount Equal across 2 Files | Status!=SUCCESS / Amount Variance |
                  | Fino DMT       | 2                  | Fino DMT Gateway Log, Fino Bank Statement     | gatewayId (across all 2 Files)    | Status=SUCCESS & Amount Equal across 2 Files | Status!=SUCCESS / Amount Variance |
                  | NSDL DMT       | 2                  | NSDL Money Transfer Switch, NSDL Host Clearing| rrn / gatewayId                   | Status=SUCCESS & Amount Equal across 2 Files | Status!=SUCCESS / Amount Variance |

  # ---------------------------------------------------------------------------
  # Category Workflow Execution: POS / Cashpoint
  # ---------------------------------------------------------------------------
        @wizard @category_pos
        Scenario Outline: Sequential 6-step wizard execution for POS / Cashpoint sub-products
            Given the user selects category "POS / Cashpoint" on Step 1 "Category Selection"
             When the user selects sub-product "<SubProductName>" on Step 2
             Then the wizard advances to Step 3 "Date & Settlement Cycle Configuration"
              And the user selects Business Date "2026-07-28" and Settlement Cycle "Cycle 1"
             When the user proceeds to Step 4 "Per-File Collection"
             Then the system configures required source file count as <RequiredFilesCount>
              And specifies required input source files as "<RequiredFileNames>"
              And internal files will auto fetch from bucket for <RequiredFileNames>
              And bank files are collected via upload
             When bank files are uploaded on Step 4
             Then internal files auto fetch from bucket
              And reconciliation engine automatically initiates for <SubProductName>
             Then the processing engine joins source files on column "<JoinColumn>" using matching rule "<MatchingRule>"
              And identifies exception records using mismatching rule "<MismatchingRule>"
              And Step 6 renders heading "Reconciliation Results & Reports" with KPI summary metrics and downloadable reports

        Examples:
                  | SubProductName     | RequiredFilesCount | RequiredFileNames                                 | JoinColumn       | MatchingRule                  | MismatchingRule                   |
                  | POS                | 3                  | mPOS Terminal Log, Card Switch, Acquirer Card     | Terminal_Id, RRN | Status=SUCCESS & Amount Equal | Status!=SUCCESS / Amount Variance |
                  | Cashpoint          | 2                  | Cashpoint Terminal Request, Banking Settlement    | RRN              | Status=SUCCESS & Amount Equal | Status!=SUCCESS / Amount Variance |

  # ---------------------------------------------------------------------------
  # Category Workflow Execution: RBL CASHOUT/PAYOUT
  # ---------------------------------------------------------------------------
        @wizard @category_cashout
        Scenario Outline: Sequential 6-step wizard execution for RBL CASHOUT/PAYOUT sub-products
            Given the user selects category "RBL CASHOUT/PAYOUT" on Step 1 "Category Selection"
             When the user selects sub-product "<SubProductName>" on Step 2
             Then the wizard advances to Step 3 "Date & Settlement Cycle Configuration"
              And the user selects Business Date "2026-07-28" and Settlement Cycle "Cycle 1"
             When the user proceeds to Step 4 "Per-File Collection"
             Then the system configures required source file count as <RequiredFilesCount>
              And specifies required input source files as "<RequiredFileNames>"
              And internal files will auto fetch from bucket for <RequiredFileNames>
              And bank files are collected via upload
             When bank files are uploaded on Step 4
             Then internal files auto fetch from bucket
              And reconciliation engine automatically initiates for <SubProductName>
             Then the processing engine joins source files on column "<JoinColumn>" using matching rule "<MatchingRule>"
              And identifies exception records using mismatching rule "<MismatchingRule>"
              And Step 6 renders heading "Reconciliation Results & Reports" with KPI summary metrics and downloadable reports

        Examples:
                  | SubProductName                  | RequiredFilesCount | RequiredFileNames                                      | JoinColumn    | MatchingRule                  | MismatchingRule                   |
                  | Wallet2Cashout                  | 2                  | Payout Gateway Log, RBL Nodal Bank Statement           | Client_Ref_No | Status=SUCCESS & Amount Equal | Status!=SUCCESS / Amount Variance |
                  | W2Cashout IMPS                  | 2                  | W2Cashout IMPS Switch Log, IMPS Nodal Clearing Report  | RRN           | Status=SUCCESS & Amount Equal | Status!=SUCCESS / Amount Variance |
                  | NSDL Cashout (4-Way Recon)      | 4                  | NSDL Cashout Gateway, Switch, NPCI, NSDL Bank CBS      | Client_Ref_No | Status=SUCCESS & Amount Equal | Status!=SUCCESS / Amount Variance |
                  | Axis Cashout & Payout Recon     | 2                  | Axis Payout Engine Log, Axis Corporate Host Statement  | Client_Ref_No | Status=SUCCESS & Amount Equal | Status!=SUCCESS / Amount Variance |
                  | IPPB Cashout                    | 2                  | IPPB Cashout Switch Log, IPPB Clearing Report          | Client_Ref_No | Status=SUCCESS & Amount Equal | Status!=SUCCESS / Amount Variance |

  # ---------------------------------------------------------------------------
  # Category Workflow Execution: PREPAID CARD
  # ---------------------------------------------------------------------------
        @wizard @category_prepaidcard
        Scenario Outline: Sequential 6-step wizard execution for PREPAID CARD sub-products
            Given the user selects category "PREPAID CARD" on Step 1 "Category Selection"
             When the user selects sub-product "<SubProductName>" on Step 2
             Then the wizard advances to Step 3 "Date & Settlement Cycle Configuration"
              And the user selects Business Date "2026-07-28" and Settlement Cycle "Cycle 1"
             When the user proceeds to Step 4 "Per-File Collection"
             Then the system configures required source file count as <RequiredFilesCount>
              And specifies required input source files as "<RequiredFileNames>"
              And internal files will auto fetch from bucket for <RequiredFileNames>
              And bank files are collected via upload
             When bank files are uploaded on Step 4
             Then internal files auto fetch from bucket
              And reconciliation engine automatically initiates for <SubProductName>
             Then the processing engine joins source files on column "<JoinColumn>" using matching rule "<MatchingRule>"
              And identifies exception records using mismatching rule "<MismatchingRule>"
              And Step 6 renders heading "Reconciliation Results & Reports" with KPI summary metrics and downloadable reports

        Examples:
                  | SubProductName | RequiredFilesCount | RequiredFileNames                                   | JoinColumn       | MatchingRule                  | MismatchingRule                   |
                  | PREPAID CARD   | 2                  | Card Management Gateway Log, Issuer Bank Settlement | Card_Number, RRN | Status=SUCCESS & Amount Equal | Status!=SUCCESS / Amount Variance |

  # ---------------------------------------------------------------------------
  # Category Workflow Execution: WALLET RECON
  # ---------------------------------------------------------------------------
        @wizard @category_walletrecon
        Scenario Outline: Sequential 6-step wizard execution for WALLET RECON sub-products
            Given the user selects category "WALLET RECON" on Step 1 "Category Selection"
             When the user selects sub-product "<SubProductName>" on Step 2
             Then the wizard advances to Step 3 "Date & Settlement Cycle Configuration"
              And the user selects Business Date "2026-07-28" and Settlement Cycle "Cycle 1"
             When the user proceeds to Step 4 "Per-File Collection"
             Then the system configures required source file count as <RequiredFilesCount>
              And specifies required input source files as "<RequiredFileNames>"
              And internal files will auto fetch from bucket for <RequiredFileNames>
              And bank files are collected via upload
             When bank files are uploaded on Step 4
             Then internal files auto fetch from bucket
              And reconciliation engine automatically initiates for <SubProductName>
             Then the processing engine joins source files on column "<JoinColumn>" using matching rule "<MatchingRule>"
              And identifies exception records using mismatching rule "<MismatchingRule>"
              And Step 6 renders heading "Reconciliation Results & Reports" with KPI summary metrics and downloadable reports

        Examples:
                  | SubProductName                 | RequiredFilesCount | RequiredFileNames                              | JoinColumn        | MatchingRule                  | MismatchingRule                   |
                  | Wallet Recon (System Wallet)   | 2                  | Internal Main Wallet Log, System Core DB Ledger| Wallet_Account_Id | Status=SUCCESS & Amount Equal | Status!=SUCCESS / Amount Variance |

  # ---------------------------------------------------------------------------
  # Category Workflow Execution: COMMISSION RECON
  # ---------------------------------------------------------------------------
        @wizard @category_commissionrecon
        Scenario Outline: Sequential 6-step wizard execution for COMMISSION RECON sub-products
            Given the user selects category "COMMISSION RECON" on Step 1 "Category Selection"
             When the user selects sub-product "<SubProductName>" on Step 2
             Then the wizard advances to Step 3 "Date & Settlement Cycle Configuration"
              And the user selects Business Date "2026-07-28" and Settlement Cycle "Cycle 1"
             When the user proceeds to Step 4 "Per-File Collection"
             Then the system configures required source file count as <RequiredFilesCount>
              And specifies required input source files as "<RequiredFileNames>"
              And internal files will auto fetch from bucket for <RequiredFileNames>
              And bank files are collected via upload
             When bank files are uploaded on Step 4
             Then internal files auto fetch from bucket
              And reconciliation engine automatically initiates for <SubProductName>
             Then the processing engine joins source files on column "<JoinColumn>" using matching rule "<MatchingRule>"
              And identifies exception records using mismatching rule "<MismatchingRule>"
              And Step 6 renders heading "Reconciliation Results & Reports" with KPI summary metrics and downloadable reports

        Examples:
                  | SubProductName                              | RequiredFilesCount | RequiredFileNames                                         | JoinColumn    | MatchingRule                      | MismatchingRule                       |
                  | COMMISSION RECON                             | 2                  | Commission Distribution Log, TDS & GST Commission Ledger   | Master_Txn_Id | Status=SUCCESS & Commission Equal | Status!=SUCCESS / Commission Variance |
                  | FINO AePS Cash Withdrawal Commission Recon  | 2                  | Fino CW Commission Log, Fino Commission Audit Sheet       | Master_Txn_Id | Status=SUCCESS & Commission Equal | Status!=SUCCESS / Commission Variance |
                  | FINO AePS Mini Statement Commission Recon   | 2                  | Fino Mini Statement Commission Log, Fino Commission Ledger| Master_Txn_Id | Status=SUCCESS & Commission Equal | Status!=SUCCESS / Commission Variance |

  # ===========================================================================
  # SECTION 7: RECONCILIATION REPORT & HISTORICAL LOGS SPECIFICATION
  # ===========================================================================

        @archives @search_filter
        Scenario Outline: Filter and search historical reconciliation reports by Product, Category, Date, and Cycle
            Given the user navigates to the "Report" module via the left sidebar
             When the user enters Product or Category keyword "<SearchQuery>" in the search filter bar
              And selects Category Filter "<CategoryFilter>", Sub-Product "<SubProductFilter>", Business Date "<BusinessDate>", and Settlement Cycle "<CycleFilter>"
             Then the audit log table renders 6 columns: "Product Name", "Category", "Date & Cycle", "Match Rate %", "Status", and "Download Actions"
              And the audit log table filters historical reconciliation report records displaying Sub-Product "<SubProductName>", Category "<CategoryName>", Business Date "<BusinessDate>", Cycle "<Cycle>", and Execution Status "<ExecutionStatus>"

        Examples:
                  | SearchQuery | CategoryFilter | SubProductFilter | BusinessDate | CycleFilter | SubProductName                                       | CategoryName       | Cycle                          | ExecutionStatus |
                  | Aadharpay   | aeps           | aadharpay        | 2026-07-28   | cycle1      | Aadharpay                                            | AEPS               | Cycle 1 (00:00 - 08:00 Window) | Completed       |
                  | MATM        | matm           | matm4way         | 2026-07-27   | cycle3      | MATM 4-Way Txn Recon                                 | MATM               | Cycle 3 (16:00 - 24:00 Window) | Completed       |
                  | IMPS        | imps           | nsdlimps         | 2026-07-28   | all         | NSDL IMPS                                            | IMPS               | All Cycles (Daily Consolidated)| Completed       |
                  | UPI         | upi            | khatabook_upi    | 2026-07-28   | all         | KHATA BOOK PA/PG UPI (UPI Transaction Reconciliation)| UPI                | All Cycles (Daily Consolidated)| Completed       |
                  | Airtel      | dmt            | airteldmt        | 2026-07-25   | cycle2      | Airtel DMT                                           | DMT                | Cycle 2 (08:00 - 16:00 Window) | Completed       |

        @archives @download_reports
        Scenario Outline: Re-download historical Matched and Mismatched reconciliation report files directly from GCP Bucket
            Given the user is inspecting historical reconciliation report for Sub-Product "<SubProductName>" in the Report table
             When the user clicks the row to expand the report detail view
             Then the expanded view displays file sources and matching metrics without the "Start New Reconciliation" button
             When the user clicks the "Matched" download button for Sub-Product "<SubProductName>"
             Then the application streams the Matched report file "<MatchedFile>" directly from GCP Storage bucket
             When the user clicks the "Mismatched" download button for Sub-Product "<SubProductName>"
             Then the application streams the Mismatched report file "<MismatchedFile>" directly from GCP Storage bucket
              And logs the report re-download audit event in the system activity trail

        Examples:
                  | SubProductName                                       | MatchedFile                       | MismatchedFile                       |
                  | Aadharpay                                            | aadharpay_match_20260728.xlsx     | aadharpay_mismatch_20260728.xlsx     |
                  | NSDL IMPS                                            | nsdlimps_match_20260728.xlsx      | nsdlimps_mismatch_20260728.xlsx      |
                  | KHATA BOOK PA/PG UPI (UPI Transaction Reconciliation)| khatabook_upi_match_20260728.xlsx | khatabook_upi_mismatch_20260728.xlsx |
                  | Airtel DMT                                           | airteldmt_match_20260728.xlsx     | airteldmt_mismatch_20260728.xlsx     |
