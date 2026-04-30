-- ============================================================
-- MedLine Surgical Solutions CRM — Seed Data
-- ============================================================
-- Fixed UUIDs for referential integrity:
--   Accounts:      00000000-0000-0000-0000-000000000001 .. 0010
--   Contacts:      00000000-0000-0000-0000-000000000101 .. 0125
--   Opportunities: 00000000-0000-0000-0000-000000000201 .. 0210
--   Activities:    00000000-0000-0000-0000-000000000301 .. 0325
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- ACCOUNTS (10 hospital systems)
-- ────────────────────────────────────────────────────────────
INSERT INTO accounts (id, name, industry_segment, region, annual_contract_value, status, primary_contact_name, primary_contact_email, last_activity_date, notes) VALUES
('00000000-0000-0000-0000-000000000001', 'Mount Sinai Health System', 'orthopedics/general_surgery', 'Northeast', 2400000, 'active', 'Dr. Rebecca Torres', 'r.torres@mountsinai.org', '2026-04-25', 'Long-standing account — 7-year relationship. Primary focus on orthopedic implants and general surgical disposables. Key decision-maker is VP Procurement.'),
('00000000-0000-0000-0000-000000000002', 'Cleveland Clinic', 'cardiology/neurosurgery', 'Midwest', 3100000, 'active', 'Mark Sullivan', 'm.sullivan@clevelandclinic.org', '2026-04-22', 'Top-tier account with expanding needs in cardiac catheterization and neuro instrument trays. Recently consolidated purchasing under new supply chain director.'),
('00000000-0000-0000-0000-000000000003', 'Mayo Clinic', 'full_catalog', 'Midwest', 4200000, 'active', 'Dr. Linda Cheng', 'l.cheng@mayo.edu', '2026-04-28', 'Our largest Midwest account. Full catalog customer across all surgical departments. Annual QBR scheduled for May. Exploring robotic surgery platform expansion.'),
('00000000-0000-0000-0000-000000000004', 'HCA Healthcare', 'general_surgery/procurement', 'Southeast', 5800000, 'active', 'Tom Bradley', 't.bradley@hcahealthcare.com', '2026-04-20', 'Largest account by ACV. Multi-facility system with centralized procurement. Currently expanding disposables contract across 12 additional facilities.'),
('00000000-0000-0000-0000-000000000005', 'Kaiser Permanente', 'orthopedics/cardiology', 'West', 3700000, 'active', 'Angela Reyes', 'a.reyes@kp.org', '2026-04-18', 'Strong West Coast presence. Dual-segment customer. Interested in robotic surgery instruments — could be a major upsell if pilot goes well.'),
('00000000-0000-0000-0000-000000000006', 'Johns Hopkins Medicine', 'neurosurgery', 'Northeast', 0, 'prospect', 'Dr. Kwame Asante', 'k.asante@jhmi.edu', '2026-04-15', 'New prospect. Their neurosurgery department is evaluating alternatives to current supplier. Sent eval kit — awaiting feedback from Dr. Asante.'),
('00000000-0000-0000-0000-000000000007', 'NYU Langone Health', 'general_surgery', 'Northeast', 1900000, 'active', 'Patricia Novak', 'p.novak@nyulangone.org', '2026-04-27', 'Solid mid-tier account. Just renewed annual supply agreement. Relationship managed by David Chen — very stable.'),
('00000000-0000-0000-0000-000000000008', 'Cedars-Sinai Medical Center', 'cardiology', 'West', 0, 'prospect', 'Dr. Raj Patel', 'r.patel@csmc.edu', '2026-04-10', 'Early-stage prospect. Cardiology department exploring new cath lab suppliers. Competitor Medtronic currently holds the contract. Need to differentiate on service and pricing.'),
('00000000-0000-0000-0000-000000000009', 'Massachusetts General Hospital', 'orthopedics', 'Northeast', 2100000, 'churned', 'Susan Weatherford', 's.weatherford@partners.org', '2026-03-28', 'Lost to Stryker 6 months ago on price. Relationship was strong — they are open to re-evaluating if we can match pricing and improve delivery SLAs.'),
('00000000-0000-0000-0000-000000000010', 'Banner Health', 'general_surgery', 'Southwest', 0, 'prospect', 'Carlos Mendez', 'c.mendez@bannerhealth.com', '2026-04-12', 'New prospect in the Southwest. 30-hospital system looking to standardize surgical supplies. Initial outreach made — discovery call scheduled for May 5.');


-- ────────────────────────────────────────────────────────────
-- CONTACTS (25 — 2-3 per account)
-- ────────────────────────────────────────────────────────────
INSERT INTO contacts (id, name, title, email, phone, account_id, notes) VALUES
-- Mount Sinai (3)
('00000000-0000-0000-0000-000000000101', 'Dr. Rebecca Torres', 'Chief of Orthopedic Surgery', 'r.torres@mountsinai.org', '212-555-0101', '00000000-0000-0000-0000-000000000001', 'Key clinical champion. Has final say on implant selection. Prefers in-person meetings.'),
('00000000-0000-0000-0000-000000000102', 'Daniel Kowalski', 'VP of Procurement', 'd.kowalski@mountsinai.org', '212-555-0102', '00000000-0000-0000-0000-000000000001', 'Controls budget allocation. Data-driven — always wants ROI analysis with proposals.'),
('00000000-0000-0000-0000-000000000103', 'Maria Santos', 'OR Manager', 'm.santos@mountsinai.org', '212-555-0103', '00000000-0000-0000-0000-000000000001', 'Day-to-day operations contact. Manages instrument tray logistics and sterilization scheduling.'),

-- Cleveland Clinic (3)
('00000000-0000-0000-0000-000000000104', 'Mark Sullivan', 'Supply Chain Director', 'm.sullivan@clevelandclinic.org', '216-555-0104', '00000000-0000-0000-0000-000000000002', 'New to role (6 months). Previously at Vizient GPO. Wants to consolidate vendors.'),
('00000000-0000-0000-0000-000000000105', 'Dr. Priya Sharma', 'Director of Cardiac Surgery', 'p.sharma@clevelandclinic.org', '216-555-0105', '00000000-0000-0000-0000-000000000002', 'Clinical lead for cardiology suite upgrade evaluation. Very detail-oriented on instrument specs.'),
('00000000-0000-0000-0000-000000000106', 'Robert Kim', 'OR Manager — Neurosurgery', 'r.kim@clevelandclinic.org', '216-555-0106', '00000000-0000-0000-0000-000000000002', 'Manages neuro OR scheduling. Good internal advocate for MedLine products.'),

-- Mayo Clinic (3)
('00000000-0000-0000-0000-000000000107', 'Dr. Linda Cheng', 'Chief of Surgery', 'l.cheng@mayo.edu', '507-555-0107', '00000000-0000-0000-0000-000000000003', 'Executive sponsor for the relationship. Met at AAOS conference last year. Strong believer in our robotic surgery platform.'),
('00000000-0000-0000-0000-000000000108', 'Brian Holloway', 'Director of Surgical Services', 'b.holloway@mayo.edu', '507-555-0108', '00000000-0000-0000-0000-000000000003', 'Operational lead — manages all surgical department procurement. Quarterly check-in cadence.'),
('00000000-0000-0000-0000-000000000109', 'Janet Olsen', 'VP of Procurement', 'j.olsen@mayo.edu', '507-555-0109', '00000000-0000-0000-0000-000000000003', 'Budget authority. Prefers 3-year contracts with volume discount tiers.'),

-- HCA Healthcare (3)
('00000000-0000-0000-0000-000000000110', 'Tom Bradley', 'VP of Supply Chain', 't.bradley@hcahealthcare.com', '615-555-0110', '00000000-0000-0000-0000-000000000004', 'Central procurement decision-maker for all HCA facilities. Relationship since 2020.'),
('00000000-0000-0000-0000-000000000111', 'Karen Whitfield', 'Director of Surgical Services', 'k.whitfield@hcahealthcare.com', '615-555-0111', '00000000-0000-0000-0000-000000000004', 'Oversees surgical departments across Southeast region. Key contact for disposables expansion.'),
('00000000-0000-0000-0000-000000000112', 'Dr. James Faulkner', 'Chief Medical Officer — Southeast Division', 'j.faulkner@hcahealthcare.com', '615-555-0112', '00000000-0000-0000-0000-000000000004', 'Clinical authority for product approvals. Needs clinical evidence and peer references.'),

-- Kaiser Permanente (2)
('00000000-0000-0000-0000-000000000113', 'Angela Reyes', 'Director of Procurement', 'a.reyes@kp.org', '510-555-0113', '00000000-0000-0000-0000-000000000005', 'Primary procurement contact. Manages vendor relationships across Kaiser West Coast facilities.'),
('00000000-0000-0000-0000-000000000114', 'Dr. Steven Park', 'Department Head — Orthopedics', 's.park@kp.org', '510-555-0114', '00000000-0000-0000-0000-000000000005', 'Clinical decision-maker for orthopedic instruments. Interested in robotic surgery pilot program.'),

-- Johns Hopkins (2)
('00000000-0000-0000-0000-000000000115', 'Dr. Kwame Asante', 'Chief of Neurosurgery', 'k.asante@jhmi.edu', '410-555-0115', '00000000-0000-0000-0000-000000000006', 'World-renowned neurosurgeon. Evaluating our micro-instrument line for minimally invasive procedures.'),
('00000000-0000-0000-0000-000000000116', 'Lisa Drummond', 'Supply Chain Manager', 'l.drummond@jhmi.edu', '410-555-0116', '00000000-0000-0000-0000-000000000006', 'Procurement gatekeeper. Need to get past her to reach clinical staff. Prefers email communication.'),

-- NYU Langone (2)
('00000000-0000-0000-0000-000000000117', 'Patricia Novak', 'VP of Procurement', 'p.novak@nyulangone.org', '212-555-0117', '00000000-0000-0000-0000-000000000007', 'Long-term contact — 5+ year relationship. Very loyal to MedLine. Advocates internally for our products.'),
('00000000-0000-0000-0000-000000000118', 'Dr. Michael Osei', 'Director of General Surgery', 'm.osei@nyulangone.org', '212-555-0118', '00000000-0000-0000-0000-000000000007', 'Clinical lead. Provided testimonial for our disposables line last year. Good reference customer.'),

-- Cedars-Sinai (2)
('00000000-0000-0000-0000-000000000119', 'Dr. Raj Patel', 'Chief of Cardiology', 'r.patel@csmc.edu', '310-555-0119', '00000000-0000-0000-0000-000000000008', 'Interested but cautious. Currently using Medtronic. Wants side-by-side comparison data before committing.'),
('00000000-0000-0000-0000-000000000120', 'Diane Nakamura', 'OR Manager — Cardiac Cath Lab', 'd.nakamura@csmc.edu', '310-555-0120', '00000000-0000-0000-0000-000000000008', 'Operational contact for cath lab. Concerned about transition logistics and staff training.'),

-- Mass General (3)
('00000000-0000-0000-0000-000000000121', 'Susan Weatherford', 'VP of Supply Chain', 's.weatherford@partners.org', '617-555-0121', '00000000-0000-0000-0000-000000000009', 'Key decision-maker in the switch to Stryker. Expressed regret about service quality decline. Open to re-engagement.'),
('00000000-0000-0000-0000-000000000122', 'Dr. Alan Forsythe', 'Chief of Orthopedic Surgery', 'a.forsythe@partners.org', '617-555-0122', '00000000-0000-0000-0000-000000000009', 'Clinical champion who opposed the switch to Stryker. Would welcome MedLine back if pricing is competitive.'),
('00000000-0000-0000-0000-000000000123', 'Nina Petrova', 'OR Manager', 'n.petrova@partners.org', '617-555-0123', '00000000-0000-0000-0000-000000000009', 'Frontline operations contact. Reports instrument quality issues with current Stryker trays.'),

-- Banner Health (2)
('00000000-0000-0000-0000-000000000124', 'Carlos Mendez', 'VP of Supply Chain', 'c.mendez@bannerhealth.com', '602-555-0124', '00000000-0000-0000-0000-000000000010', 'New contact from LinkedIn outreach. Interested in standardizing across 30 hospitals. Budget cycle starts in July.'),
('00000000-0000-0000-0000-000000000125', 'Dr. Heather Dawson', 'Director of Surgical Services', 'h.dawson@bannerhealth.com', '602-555-0125', '00000000-0000-0000-0000-000000000010', 'Clinical lead for general surgery standardization initiative. Wants product demos before May QBR.');


-- ────────────────────────────────────────────────────────────
-- OPPORTUNITIES (10)
-- ────────────────────────────────────────────────────────────
INSERT INTO opportunities (id, name, account_id, stage, value, expected_close, owner, notes) VALUES
('00000000-0000-0000-0000-000000000201', 'Orthopedic Implants Renewal', '00000000-0000-0000-0000-000000000001', 'negotiation', 1200000, '2026-06-30', 'Sarah Mitchell', 'Renewal of 3-year orthopedic implants contract. Mount Sinai wants 5% volume discount. Need to finalize pricing tiers by end of May. Dr. Torres is supportive.'),
('00000000-0000-0000-0000-000000000202', 'Disposables Contract Expansion', '00000000-0000-0000-0000-000000000004', 'proposal', 800000, '2026-07-15', 'Sarah Mitchell', 'Expanding disposables contract to 12 additional HCA facilities in Southeast region. Proposal sent April 18. Awaiting review by Tom Bradley.'),
('00000000-0000-0000-0000-000000000203', 'Cardiology Suite Upgrade', '00000000-0000-0000-0000-000000000002', 'qualification', 1500000, '2026-09-30', 'James Park', 'Cleveland Clinic upgrading cardiac catheterization suites. We are one of three vendors being evaluated. Dr. Sharma leading the evaluation committee.'),
('00000000-0000-0000-0000-000000000204', 'Robotic Surgery Instruments', '00000000-0000-0000-0000-000000000005', 'prospecting', 2000000, '2026-12-31', 'James Park', 'Kaiser interested in robotic surgery instrument pilot. Early conversations with Dr. Park. Need to schedule product demo at Oakland facility.'),
('00000000-0000-0000-0000-000000000205', 'Neurosurgery Eval Kit', '00000000-0000-0000-0000-000000000006', 'prospecting', 400000, '2026-10-31', 'Sarah Mitchell', 'Sent evaluation kit of micro-instruments to Dr. Asante. Awaiting clinical feedback. Lisa Drummond is the procurement gatekeeper — need to build that relationship.'),
('00000000-0000-0000-0000-000000000206', 'Annual Supply Agreement', '00000000-0000-0000-0000-000000000007', 'closed_won', 1900000, '2026-04-01', 'David Chen', 'Renewed annual supply agreement with NYU Langone. 2-year term with 3% annual escalator. Patricia Novak championed internally. Signed March 28.'),
('00000000-0000-0000-0000-000000000207', 'Cardiac Cath Lab Bundle', '00000000-0000-0000-0000-000000000008', 'qualification', 600000, '2026-11-30', 'James Park', 'Cedars-Sinai evaluating alternatives to Medtronic for cath lab supplies. Dr. Patel wants side-by-side comparison. Need to provide clinical data and references.'),
('00000000-0000-0000-0000-000000000208', 'Win-Back Proposal', '00000000-0000-0000-0000-000000000009', 'proposal', 1800000, '2026-08-31', 'Sarah Mitchell', 'Win-back opportunity at Mass General. They switched to Stryker 6 months ago but are unhappy with service levels. Susan Weatherford open to re-evaluating if we match pricing.'),
('00000000-0000-0000-0000-000000000209', 'Surgical Robotics Platform', '00000000-0000-0000-0000-000000000003', 'negotiation', 3200000, '2026-06-15', 'David Chen', 'Major expansion of robotic surgery platform at Mayo Clinic. Dr. Cheng is executive sponsor. Final pricing negotiation underway — competing against Intuitive Surgical.'),
('00000000-0000-0000-0000-000000000210', 'General Surgery Starter Kit', '00000000-0000-0000-0000-000000000010', 'prospecting', 350000, '2027-01-31', 'David Chen', 'Banner Health looking to standardize general surgery supplies across 30 hospitals. Discovery call scheduled for May 5 with Carlos Mendez.');


-- ────────────────────────────────────────────────────────────
-- ACTIVITIES (25 recent interactions)
-- ────────────────────────────────────────────────────────────
INSERT INTO activities (id, type, account_id, contact_id, opportunity_id, date, summary, next_steps) VALUES

-- Mount Sinai activities
('00000000-0000-0000-0000-000000000301', 'meeting', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000201', '2026-04-25 10:00:00-04', 'Quarterly business review with procurement team — discussed volume discounts for Q3 and reviewed implant utilization data. Daniel wants a 5% discount for 3-year commitment.', 'Send revised pricing proposal with 3-year volume discount tiers by May 2.'),
('00000000-0000-0000-0000-000000000302', 'call', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000201', '2026-04-22 14:30:00-04', 'Spoke with Dr. Torres about new titanium alloy implant line. She wants to trial it in 3 cases before committing to the renewal. Very positive on MedLine quality.', 'Coordinate trial cases with OR Manager Maria Santos. Target first trial week of May 5.'),
('00000000-0000-0000-0000-000000000303', 'email', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000103', NULL, '2026-04-20 09:15:00-04', 'Maria Santos requested updated sterilization guidelines for the new arthroscopic instrument trays. Sent PDF with updated protocols.', 'Follow up in one week to confirm sterilization team has reviewed the guidelines.'),

-- Cleveland Clinic activities
('00000000-0000-0000-0000-000000000304', 'meeting', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000203', '2026-04-22 09:00:00-04', 'Demo of new arthroscopic instruments with Dr. Sharma and the cardiac surgery team. She was very interested in the catheter guide wire system — wants to trial in Cath Lab 2.', 'Schedule trial procedure for week of May 12. Provide clinical evidence packet to Dr. Sharma.'),
('00000000-0000-0000-0000-000000000305', 'call', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000203', '2026-04-18 11:00:00-04', 'Introductory call with Mark Sullivan — new Supply Chain Director. He wants to consolidate from 8 surgical supply vendors down to 3. MedLine is in a strong position given existing relationship.', 'Send Mark a comprehensive product catalog and case studies from similar health systems.'),
('00000000-0000-0000-0000-000000000306', 'email', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000106', NULL, '2026-04-15 16:00:00-04', 'Robert Kim flagged that two neuro instrument trays were delivered with missing retractors. Escalated to fulfillment team — replacement shipped same day.', 'Confirm delivery of replacement trays. Schedule quality review meeting with fulfillment.'),

-- Mayo Clinic activities
('00000000-0000-0000-0000-000000000307', 'meeting', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000000209', '2026-04-28 13:00:00-05', 'Executive meeting with Dr. Cheng on surgical robotics platform expansion. She confirmed Mayo wants to move forward but is comparing our proposal against Intuitive Surgical. Price is the main differentiator.', 'Prepare final best-and-final pricing by May 5. Include 5-year service agreement with dedicated on-site technician.'),
('00000000-0000-0000-0000-000000000308', 'call', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000109', '00000000-0000-0000-0000-000000000209', '2026-04-24 10:30:00-05', 'Janet Olsen confirmed budget approval for up to $3.5M for the robotics platform. She prefers a 3-year contract with option to extend. Wants volume discount tiers built in.', 'Align pricing model with $3.5M ceiling. Send contract draft to legal by April 30.'),
('00000000-0000-0000-0000-000000000309', 'email', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000108', NULL, '2026-04-21 08:45:00-05', 'Brian Holloway requested an inventory audit of all MedLine products currently in Mayo Clinic supply rooms. Coordinating with our logistics team to schedule for early May.', 'Schedule on-site inventory audit for May 8-9. Send two logistics specialists.'),

-- HCA Healthcare activities
('00000000-0000-0000-0000-000000000310', 'proposal', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000110', '00000000-0000-0000-0000-000000000202', '2026-04-20 15:00:00-04', 'Proposal sent for disposables contract expansion to 12 additional facilities. Includes tiered pricing based on volume: 3% discount at 500K units, 5% at 1M units. Tom Bradley acknowledged receipt.', 'Follow up with Tom on May 1 for initial feedback. Prepare responses to anticipated objections on delivery timelines.'),
('00000000-0000-0000-0000-000000000311', 'call', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000111', '00000000-0000-0000-0000-000000000202', '2026-04-17 14:00:00-04', 'Karen Whitfield raised concerns about delivery lead times to rural facilities in the Southeast. Current SLA is 48 hours — she wants 24 hours for critical surgical supplies.', 'Work with logistics to evaluate 24-hour delivery feasibility for Southeast rural facilities. Get cost estimate for regional distribution center.'),
('00000000-0000-0000-0000-000000000312', 'meeting', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000112', NULL, '2026-04-14 10:00:00-04', 'Clinical review meeting with Dr. Faulkner. Presented clinical evidence for our new hemostatic agents. He wants peer-reviewed studies and references from comparable health systems.', 'Compile peer-reviewed study package. Arrange reference call with Mayo Clinic CMO.'),

-- Kaiser Permanente activities
('00000000-0000-0000-0000-000000000313', 'call', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000114', '00000000-0000-0000-0000-000000000204', '2026-04-18 16:00:00-07', 'Initial conversation with Dr. Steven Park about robotic surgery instrument pilot. He has budget for a 6-month trial in the Oakland orthopedics department. Wants hands-on demo first.', 'Schedule product demo at Kaiser Oakland facility for week of May 19. Bring robotic surgery specialist.'),
('00000000-0000-0000-0000-000000000314', 'email', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000113', NULL, '2026-04-15 11:30:00-07', 'Angela Reyes requested updated pricing for Q3 orthopedic supply order. Sent revised quote with 2% early-order discount for commitments before May 15.', 'Follow up on May 10 if no response. Prepare alternative pricing if early-order deadline is missed.'),

-- Johns Hopkins activities
('00000000-0000-0000-0000-000000000315', 'email', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000116', '00000000-0000-0000-0000-000000000205', '2026-04-15 09:00:00-04', 'Cold outreach to Lisa Drummond, Supply Chain Manager — introduced MedLine''s neurosurgery product line and referenced Dr. Asante''s interest in our micro-instrument eval kit.', 'Wait for response. If no reply by April 22, follow up with phone call. Consider sending product samples.'),
('00000000-0000-0000-0000-000000000316', 'call', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000115', '00000000-0000-0000-0000-000000000205', '2026-04-12 13:00:00-04', 'Spoke with Dr. Asante about the eval kit delivery. He confirmed receipt and plans to test micro-forceps and dissectors in his next three craniotomy cases. Expects feedback within 3 weeks.', 'Check in with Dr. Asante around May 3 for preliminary clinical feedback on the eval kit.'),

-- NYU Langone activities
('00000000-0000-0000-0000-000000000317', 'meeting', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000117', '00000000-0000-0000-0000-000000000206', '2026-04-27 11:00:00-04', 'Contract signing celebration lunch with Patricia Novak. Reviewed terms of the new 2-year supply agreement. She expressed interest in expanding to include specialty surgical instruments next year.', 'Send thank-you note and MedLine specialty catalog. Flag NYU Langone for upsell opportunity in Q1 2027.'),
('00000000-0000-0000-0000-000000000318', 'email', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000118', NULL, '2026-04-23 10:00:00-04', 'Dr. Osei provided a written testimonial for our general surgery disposables line. He highlighted reliability and consistent quality. Requesting permission to use in marketing materials.', 'Get legal clearance to use testimonial. Send Dr. Osei a thank-you gift (within compliance limits).'),

-- Cedars-Sinai activities
('00000000-0000-0000-0000-000000000319', 'call', '00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000119', '00000000-0000-0000-0000-000000000207', '2026-04-10 14:00:00-07', 'Discovery call with Dr. Raj Patel. He is evaluating three vendors for cath lab supplies. Currently on Medtronic but unhappy with recent price increases. Wants side-by-side clinical comparison data.', 'Prepare clinical comparison deck: MedLine vs Medtronic cath lab products. Send by April 18.'),
('00000000-0000-0000-0000-000000000320', 'email', '00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000120', '00000000-0000-0000-0000-000000000207', '2026-04-08 09:30:00-07', 'Diane Nakamura asked about transition logistics — how long to onboard a new cath lab supplier, staff training requirements, and parallel-run period. Sent our standard transition playbook.', 'Schedule follow-up call with Diane to walk through the transition playbook in detail. Include our implementation specialist.'),

-- Mass General activities
('00000000-0000-0000-0000-000000000321', 'call', '00000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000121', '00000000-0000-0000-0000-000000000208', '2026-03-28 15:00:00-04', 'Follow-up on win-back — Susan Weatherford confirmed they switched to Stryker 6 months ago but are experiencing delivery delays and quality inconsistencies. She is open to re-evaluating if we can match Stryker pricing and guarantee 24-hour delivery SLAs.', 'Prepare competitive pricing proposal matching Stryker rates. Include guaranteed 24-hour delivery SLA with penalty clause.'),
('00000000-0000-0000-0000-000000000322', 'proposal', '00000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000122', '00000000-0000-0000-0000-000000000208', '2026-04-05 10:00:00-04', 'Sent win-back proposal to Dr. Forsythe and Susan Weatherford. Includes price-match guarantee, 24-hour delivery SLA, and dedicated account manager. Dr. Forsythe responded positively — wants to present to hospital board.', 'Prepare board presentation materials for Dr. Forsythe. Target board meeting in late May.'),
('00000000-0000-0000-0000-000000000323', 'email', '00000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000123', NULL, '2026-04-10 11:00:00-04', 'Nina Petrova reported that three Stryker instrument trays had bent retractors in the last month. She documented the issues and shared photos. This strengthens our win-back case.', 'Reference Nina''s quality documentation in the board presentation. Offer complimentary instrument tray quality audit.'),

-- Banner Health activities
('00000000-0000-0000-0000-000000000324', 'email', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000124', '00000000-0000-0000-0000-000000000210', '2026-04-12 10:00:00-07', 'Cold outreach to Carlos Mendez, VP Supply Chain at Banner Health. Introduced MedLine''s general surgery product line and standardization program for multi-hospital systems. He replied expressing interest.', 'Schedule discovery call for May 5. Prepare case study on HCA standardization as a reference.'),
('00000000-0000-0000-0000-000000000325', 'call', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000125', '00000000-0000-0000-0000-000000000210', '2026-04-14 13:30:00-07', 'Introductory call with Dr. Heather Dawson. She leads the surgical standardization initiative at Banner. Wants to see product demos and pricing for a pilot at 5 facilities before committing system-wide.', 'Prepare 5-facility pilot proposal with phased rollout plan. Schedule product demo for May 12 at Banner Phoenix campus.');
