/* Personality assessment bank. 5 root scenarios; each of the 4 answers leads to its own follow-up (25 questions, 10 answered per person). */

/* ---- personality bank: every option leads to its own follow-up ----
   [answer text, hidden trait points, next question] */
export const QB = {
 'Q1':{area:'Students',sc:'During your lecture, two students start a loud argument and one pushes the other. The rest of the class turns to watch you.',o:[
  ['Stop the class, separate them firmly, calm the room, and speak to both privately after class.','CA+2 OW+1','Q2-A'],
  ['Send both students straight to the HOD / discipline committee and continue teaching.','PR+2 OW-1','Q2-B'],
  ['Pause and turn it into a short class discussion on respect and handling disagreement.','SC+2 CA+1','Q2-C'],
  ['Ask them to sit down and carry on with the lesson; deal with it later if it continues.','AV+2','Q2-D']]},
 'Q2-A':{area:'Students',sc:'Later you learn the student who pushed is facing serious problems at home. The other student\'s parent calls you, demanding strict action.',o:[
  ['Explain to the parent that action will be fair, and quietly refer the first student to the counsellor.','SC+2 CO+1','Q3'],
  ['Recommend the standard disciplinary action; personal issues cannot excuse violence.','PR+2 IN+1','Q3'],
  ['Arrange a meeting with both students and both parents to resolve it together.','CO+2 OW+1','Q3'],
  ['Tell the parent this is now the HOD\'s matter and you cannot comment.','OW-1 AV+1','Q3']]},
 'Q2-B':{area:'Students',sc:'The HOD sends both students back to your class the next day, saying classroom discipline is the faculty member\'s job. Other students now treat the two as untouchable.',o:[
  ['Set clear class rules with the whole class and apply them to everyone, starting today.','CA+2 OW+2','Q3'],
  ['Ask the HOD to share the department\'s discipline procedure in writing.','PR+2','Q3'],
  ['Talk to the two students one-on-one to rebuild the relationship.','SC+2 CO+1','Q3'],
  ['Avoid conflict and let small issues pass for the rest of the semester.','AV+2 CA-1','Q3']]},
 'Q2-C':{area:'Students',sc:'During your class discussion, one of the two students stands up and says you are taking the other student\'s side. The class starts murmuring.',o:[
  ['Calmly acknowledge how they feel and offer to hear both students separately after class.','CA+2 SC+1','Q3'],
  ['Firmly end the discussion and continue with the lesson.','CA+1 PR+1','Q3'],
  ['Invite the class to share openly what they think is fair.','CO+2 CA-1','Q3'],
  ['Apologise and drop the topic completely.','AV+1 CA-1','Q3']]},
 'Q2-D':{area:'Students',sc:'A week later the same two students disrupt your class again, and a few others start recording it on their phones.',o:[
  ['Stop the recording first, then handle the two students firmly in front of the class.','CA+2','Q3'],
  ['Report the incident and the recordings to the HOD in writing the same day.','PR+2 OW+1','Q3'],
  ['Meet the two students with their class advisor to understand the root cause.','SC+2 CO+1','Q3'],
  ['Leave the classroom and let the students settle it themselves.','AV+2 CA-2','Q3']]},
 'Q3':{area:'Colleagues',sc:'You organised a successful department event. In the management review, a senior colleague presents it as their own work.',o:[
  ['Speak to the colleague privately afterwards and say how you felt.','CO+2 CA+1','Q4-A'],
  ['Share the planning documents with your HOD to set the record straight.','PR+2 OW+1','Q4-B'],
  ['Let it go; the work matters more than the credit.','RE+1 AV+1','Q4-C'],
  ['Correct it politely in the same meeting, with facts.','IN+1 CA+1 CO-1','Q4-D']]},
 'Q4-A':{area:'Colleagues',sc:'After your conversation, the colleague stops sharing information you need for your work and is cold to you in the staff room.',o:[
  ['Keep being professional and ask for the information formally by email.','PR+2 RE+1','Q5'],
  ['Ask a respected senior to help both of you talk it out.','CO+2','Q5'],
  ['Find the information through other sources and stop depending on them.','OW+1 RE+1','Q5'],
  ['Complain to management about non-cooperation.','PR+1 CO-1','Q5']]},
 'Q4-B':{area:'Colleagues',sc:'Your HOD agrees the work was yours but asks you to keep quiet about it, because the colleague is close to management.',o:[
  ['Accept it this time, and make sure your work is documented and visible next time.','PR+2 RE+1','Q5'],
  ['Respectfully ask for the record to be corrected in the next review.','IN+2 CO-1','Q5'],
  ['Let it go completely; it is not worth the tension.','AV+1 RE+1','Q5'],
  ['Talk directly and calmly with the colleague.','CO+2 CA+1','Q5']]},
 'Q4-C':{area:'Colleagues',sc:'Management now asks the same colleague to lead the next big event, and asks you to assist.',o:[
  ['Accept and give your best; good work will be noticed over time.','RE+2 CO+1','Q5'],
  ['Accept, but agree on clear roles and credit in writing at the start.','PR+2 OW+1','Q5'],
  ['Politely decline, citing your workload.','AV+1','Q5'],
  ['Accept, and quietly mention to your HOD who led the last event.','IN+1 CO+1','Q5']]},
 'Q4-D':{area:'Colleagues',sc:'After the meeting, a few colleagues tell you that correcting a senior in front of management was disrespectful.',o:[
  ['Meet the senior colleague privately to clear the air, while standing by the facts.','CO+2 IN+1','Q5'],
  ['Explain to colleagues that facts matter more than seniority.','IN+1 CO-1','Q5'],
  ['Apologise to the senior for the way you raised it.','CO+1 RE+1','Q5'],
  ['Ignore the comments and move on.','AV+1 RE+1','Q5']]},
 'Q5':{area:'Integrity',sc:'Before an inspection, you are told to raise internal marks for a group of weak students so the pass percentage looks better.',o:[
  ['Politely refuse and explain that marks must reflect performance.','IN+2 CA+1','Q6-A'],
  ['Propose remedial classes and a retest instead, so students can earn the marks.','SC+2 OW+1 IN+1','Q6-B'],
  ['Follow the instruction; it came from above.','IN-2 PR+1','Q6-C'],
  ['Follow it, but ask for the instruction in writing.','PR+2 IN-1','Q6-D']]},
 'Q6-A':{area:'Integrity',sc:'The principal tells you this is common practice everywhere, and that your appraisal could be affected.',o:[
  ['Hold your position respectfully and accept the consequence.','IN+2 RE+1','Q7'],
  ['Offer to personally run extra sessions so results improve honestly.','OW+2 SC+1','Q7'],
  ['Give in this time to protect your job.','IN-1','Q7'],
  ['Raise the matter with the IQAC or the university nominee.','PR+1 IN+1 CO-1','Q7']]},
 'Q6-B':{area:'Integrity',sc:'Management agrees to remedial classes but gives you only two evenings before the inspection, and many weak students do not turn up.',o:[
  ['Call the absent students and their parents personally to get them to attend.','OW+2 SC+1','Q7'],
  ['Record attendance and report the outcome honestly to management.','PR+2 IN+1','Q7'],
  ['Prepare short notes and practice questions students can use on their own.','SC+2 RE+1','Q7'],
  ['Tell management the plan did not work and leave the decision to them.','AV+1 OW-1','Q7']]},
 'Q6-C':{area:'Integrity',sc:'A strong student complains to you that weaker classmates got almost the same internal marks without effort.',o:[
  ['Admit the process was not fair and promise it will not happen again.','IN+2','Q7'],
  ['Explain that internal marks consider many factors, and move on.','AV+1 IN-1','Q7'],
  ['Recognise the student\'s effort through a different opportunity, like a project or award.','SC+2','Q7'],
  ['Refer the student to the HOD.','OW-1 PR+1','Q7']]},
 'Q6-D':{area:'Integrity',sc:'Management refuses to put the instruction in writing and says, "Just do it, this is how things work here."',o:[
  ['Decline to change the marks without a written instruction.','IN+2 PR+1','Q7'],
  ['Change the marks, but keep your own record of the conversation.','PR+1 IN-1','Q7'],
  ['Suggest an honest alternative, such as a retest.','OW+2 SC+1','Q7'],
  ['Escalate it to the principal or the IQAC.','PR+2 CO-1','Q7']]},
 'Q7':{area:'Pressure',sc:'Salaries have been delayed for the second month. Some colleagues plan to stop taking classes until they are paid.',o:[
  ['Join them; collective action is the only way to be heard.','CO+1 SC-2','Q8-A'],
  ['Keep teaching quietly and start looking for another job.','AV+1 RE+1','Q8-B'],
  ['Continue classes and raise the issue through a formal staff representation.','PR+2 SC+1','Q8-C'],
  ['Offer to mediate between staff and management.','CO+2 OW+1','Q8-D']]},
 'Q8-A':{area:'Pressure',sc:'The class boycott enters its third day. Final-year exams are a week away, and some students come to your cabin asking for help.',o:[
  ['Help them quietly in your free time while still supporting colleagues.','SC+2 CO+1','Q9'],
  ['Return to teaching; the students should not suffer.','SC+2 CO-1','Q9'],
  ['Tell the students to wait until the issue is resolved.','SC-2 CO+1','Q9'],
  ['Propose to colleagues that final-year classes continue during the protest.','CO+2 OW+1','Q9']]},
 'Q8-B':{area:'Pressure',sc:'Another college offers you the same salary and wants you to join in two weeks. You are mid-semester and your students\' projects are half done.',o:[
  ['Ask the new college to wait until the semester ends.','OW+2 SC+1','Q9'],
  ['Join in two weeks and hand over clear notes to a colleague.','PR+1 RE+1','Q9'],
  ['Join immediately; your own finances come first.','SC-1','Q9'],
  ['Use the offer to press your management for a clear payment date.','RE+1 CO+1','Q9']]},
 'Q8-C':{area:'Pressure',sc:'In class, students ask you whether the college is shutting down because teachers are not being paid.',o:[
  ['Reassure them calmly and bring the focus back to the lesson.','CA+2 SC+1','Q9'],
  ['Tell them openly about the salary delays.','IN+1 PR-1','Q9'],
  ['Say it is an internal matter and refuse to discuss it.','PR+1 SC-1','Q9'],
  ['Tell them to ask the office.','AV+1','Q9']]},
 'Q8-D':{area:'Pressure',sc:'Because you offered to mediate, management calls you for a one-to-one meeting and asks why the staff are unhappy.',o:[
  ['Give an honest picture of staff concerns without naming individuals.','IN+2 CO+1','Q9'],
  ['Say you are not aware of the details.','AV+2','Q9'],
  ['Speak only about your own situation.','PR+1','Q9'],
  ['Suggest a clear payment timeline that could be shared with all staff.','OW+2 CO+1','Q9']]},
 'Q9':{area:'Crisis',sc:'You are in charge of 40 students on an evening industrial visit. A student collapses, and the student\'s parents are not answering their phones.',o:[
  ['Give first aid, call an ambulance, then inform the HOD.','OW+2 CA+2','Q10-A'],
  ['Go to the hospital with the student and hand the group to a colleague.','SC+2 OW+1','Q10-B'],
  ['Call the HOD first and wait for instructions.','PR+2 OW-1','Q10-C'],
  ['Ask a senior student to take the student to hospital while you manage the group.','OW-1','Q10-D']]},
 'Q10-A':{area:'Crisis',sc:'The next day, the student\'s parent posts on social media blaming you and the college for negligence.',o:[
  ['Do not respond online; give a written account of events to the principal.','PR+2 CA+1','END'],
  ['Call the parent, listen, and explain what was done.','CO+2 SC+1','END'],
  ['Reply publicly to defend yourself.','CA-2','END'],
  ['Leave it entirely to the college.','AV+1','END']]},
 'Q10-B':{area:'Crisis',sc:'At the hospital, doctors say they need a guardian\'s consent for a procedure. The parents are still unreachable.',o:[
  ['Inform the principal immediately and follow the college\'s emergency authorisation process.','PR+2 OW+1','END'],
  ['Keep trying the parents and relatives, and share every update with the doctors.','OW+2 RE+1','END'],
  ['Sign the consent yourself to avoid any delay.','OW+1 PR-2','END'],
  ['Wait until a parent can be reached.','AV+2','END']]},
 'Q10-C':{area:'Crisis',sc:'An inquiry committee asks why it took so long to get the student to hospital.',o:[
  ['Explain the sequence honestly and accept where you could have acted faster.','IN+2 OW+2','END'],
  ['Explain that you followed procedure by informing the HOD first.','PR+2','END'],
  ['Point out that no clear emergency procedure existed for visits.','PR+1 OW-1','END'],
  ['Suggest a written emergency plan for all future visits.','OW+2 PR+1','END']]},
 'Q10-D':{area:'Crisis',sc:'The senior student calls you from the hospital, panicking. The hospital wants an adult to sign forms and an advance payment of ₹15,000.',o:[
  ['Hand the group to a colleague and go to the hospital yourself immediately.','OW+2 CA+1','END'],
  ['Call the principal to arrange payment and send a staff member.','PR+2 CO+1','END'],
  ['Pay the advance online yourself and speak to the hospital by phone.','OW+1 SC+1','END'],
  ['Tell the student to wait until the visit is over.','AV+2 SC-2','END']]}
};
