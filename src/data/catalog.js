/* Static reference data: districts by state, map coordinates, degrees, institution types, departments, subjects and option lists. */

/* ============================ 1) DATA ============================== */
export const TN_DISTRICTS = {
  'Chennai':[13.08,80.27],'Tiruvallur':[13.14,79.91],'Kancheepuram':[12.83,79.70],'Chengalpattu':[12.69,79.98],
  'Vellore':[12.92,79.13],'Ranipet':[12.93,79.33],'Tirupathur':[12.50,78.57],'Krishnagiri':[12.52,78.21],
  'Dharmapuri':[12.13,78.16],'Tiruvannamalai':[12.23,79.07],'Villupuram':[11.94,79.49],'Kallakurichi':[11.74,78.96],
  'Cuddalore':[11.75,79.75],'Salem':[11.66,78.15],'Namakkal':[11.22,78.17],'Erode':[11.34,77.72],
  'Tiruppur':[11.11,77.34],'Coimbatore':[11.02,76.96],'Nilgiris':[11.41,76.70],'Karur':[10.96,78.08],
  'Tiruchirappalli':[10.79,78.70],'Perambalur':[11.23,78.88],'Ariyalur':[11.14,79.08],'Thanjavur':[10.79,79.14],
  'Tiruvarur':[10.77,79.64],'Nagapattinam':[10.77,79.80],'Mayiladuthurai':[11.10,79.65],'Pudukkottai':[10.38,78.82],
  'Dindigul':[10.36,77.98],'Madurai':[9.93,78.12],'Theni':[10.01,77.48],'Sivaganga':[9.85,78.48],
  'Ramanathapuram':[9.37,78.83],'Virudhunagar':[9.58,77.96],'Tenkasi':[8.96,77.30],'Tirunelveli':[8.71,77.76],
  'Thoothukudi':[8.76,78.13],'Kanniyakumari':[8.12,77.50]
};
export const OTHER_CITIES = {'Bengaluru':[12.97,77.59],'Puducherry':[11.93,79.83],'Kochi':[9.93,76.27],'Thiruvananthapuram':[8.52,76.94],'Mysuru':[12.30,76.64],'Hyderabad':[17.38,78.49],'Tirupati':[13.63,79.42],'Kozhikode':[11.26,75.78],'Mangaluru':[12.91,74.86],'Ernakulam':[9.98,76.28],'Thrissur':[10.52,76.21],'Palakkad':[10.78,76.65],'Bengaluru Urban':[12.97,77.59],'Chittoor':[13.22,79.10]};
export const TN_OUTLINE = [[80.33,13.55],[79.95,13.42],[79.55,13.30],[79.15,13.05],[78.75,12.95],[78.45,12.75],[78.05,12.82],[77.75,12.70],[77.55,12.35],[77.45,12.10],[77.05,11.95],[76.70,11.80],[76.35,11.55],[76.25,11.30],[76.55,11.15],[76.75,10.95],[76.85,10.70],[77.05,10.45],[77.20,10.15],[77.15,9.80],[77.20,9.40],[77.25,8.95],[77.20,8.55],[77.55,8.05],[77.95,8.40],[78.15,8.80],[78.45,9.10],[78.95,9.25],[79.30,9.28],[79.05,9.55],[79.20,9.95],[79.35,10.30],[79.88,10.30],[79.88,10.80],[79.88,11.20],[79.80,11.75],[79.86,11.93],[80.08,12.40],[80.22,12.80],[80.30,13.08],[80.33,13.55]];
export const STATE_DISTRICTS = {
  'Tamil Nadu':Object.keys(TN_DISTRICTS),
  'Kerala':['Thiruvananthapuram','Kollam','Pathanamthitta','Alappuzha','Kottayam','Idukki','Ernakulam','Thrissur','Palakkad','Malappuram','Kozhikode','Wayanad','Kannur','Kasaragod'],
  'Karnataka':['Bagalkot','Ballari','Belagavi','Bengaluru Rural','Bengaluru Urban','Bengaluru South (Ramanagara)','Bidar','Chamarajanagar','Chikkaballapur','Chikkamagaluru','Chitradurga','Dakshina Kannada','Davanagere','Dharwad','Gadag','Hassan','Haveri','Kalaburagi','Kodagu','Kolar','Koppal','Mandya','Mysuru','Raichur','Shivamogga','Tumakuru','Udupi','Uttara Kannada','Vijayanagara','Vijayapura','Yadgir'],
  'Andhra Pradesh':['Alluri Sitharama Raju','Anakapalli','Anantapur','Annamayya','Bapatla','Chittoor','Dr. B.R. Ambedkar Konaseema','East Godavari','Eluru','Guntur','Kakinada','Krishna','Kurnool','Nandyal','NTR','Palnadu','Parvathipuram Manyam','Prakasam','Sri Potti Sriramulu Nellore','Sri Sathya Sai','Srikakulam','Tirupati','Visakhapatnam','Vizianagaram','West Godavari','YSR Kadapa'],
  'Telangana':['Adilabad','Bhadradri Kothagudem','Hanumakonda','Hyderabad','Jagtial','Jangaon','Jayashankar Bhupalpally','Jogulamba Gadwal','Kamareddy','Karimnagar','Khammam','Komaram Bheem Asifabad','Mahabubabad','Mahabubnagar','Mancherial','Medak','Medchal-Malkajgiri','Mulugu','Nagarkurnool','Nalgonda','Narayanpet','Nirmal','Nizamabad','Peddapalli','Rajanna Sircilla','Rangareddy','Sangareddy','Siddipet','Suryapet','Vikarabad','Wanaparthy','Warangal','Yadadri Bhuvanagiri'],
  'Puducherry':['Puducherry','Karaikal','Mahe','Yanam'],
  'Goa':['North Goa','South Goa'],
  'Maharashtra':['Ahilyanagar','Akola','Amravati','Beed','Bhandara','Buldhana','Chandrapur','Chhatrapati Sambhajinagar','Dharashiv','Dhule','Gadchiroli','Gondia','Hingoli','Jalgaon','Jalna','Kolhapur','Latur','Mumbai City','Mumbai Suburban','Nagpur','Nanded','Nandurbar','Nashik','Palghar','Parbhani','Pune','Raigad','Ratnagiri','Sangli','Satara','Sindhudurg','Solapur','Thane','Wardha','Washim','Yavatmal']
};
export const STATES = [...Object.keys(STATE_DISTRICTS),'Other'];
export const districtsOf = st => (STATE_DISTRICTS[st]||[]).slice().sort();

export const UG_DEGREES = ['B.E','B.Tech','B.Arch','B.Sc','B.Sc Nursing','B.Sc Agriculture','B.Sc Allied Health Sciences','B.Sc Medical Lab Technology','BCA','BBA','BBM','B.Com','B.Com (CA)','B.A','B.Pharm','Pharm.D','BPT (Physiotherapy)','BOT (Occupational Therapy)','MBBS','BDS','BAMS','BHMS','BSMS (Siddha)','B.Ed','LLB','BA LLB','B.Des','BHM (Hotel Management)','BFA','B.Voc','BSW','Diploma (Polytechnic)','Other'];
export const PG_DEGREES = ['M.E','M.Tech','M.Arch','MBA','PGDM','M.Sc','M.Sc Nursing','MCA','M.Com','M.A','M.Pharm','MPT (Physiotherapy)','MOT (Occupational Therapy)','MD','MS','MDS','M.Ed','LLM','M.Des','MSW','MFA','M.Voc','M.Phil','PG Diploma','Other'];

export const INST_TYPES = {
  'Engineering & Technology':['Civil','Mechanical','EEE','ECE','CSE','IT','AI & DS','AI & ML','Cyber Security','Biomedical','Chemical','Automobile','Aeronautical','Science & Humanities'],
  'Arts & Science':['English','Tamil','Mathematics','Physics','Chemistry','Computer Science','BCA','Commerce','Commerce (CA)','Economics','Psychology','Visual Communication','Biotechnology','Microbiology'],
  'Pharmacy':['Pharmaceutics','Pharmacology','Pharmaceutical Chemistry','Pharmacognosy','Pharmacy Practice'],
  'Nursing':['Medical-Surgical Nursing','Community Health Nursing','Obstetrics & Gynaecology Nursing','Paediatric Nursing','Mental Health Nursing'],
  'Allied Health Sciences':['Medical Lab Technology','Radiology & Imaging','Cardiac Technology','Optometry','Physician Assistant'],
  'Occupational Therapy':['Paediatric OT','Neurological OT','Orthopaedic OT','Mental Health OT'],
  'Physiotherapy':['Orthopaedics','Neurology','Cardio-Respiratory','Sports Physiotherapy'],
  'Management (MBA/BBA)':['Marketing','Finance','HR','Operations','Business Analytics','Entrepreneurship'],
  'Law':['Constitutional Law','Corporate Law','Criminal Law'],
  'Architecture':['Design Studio','Building Construction','Urban Planning'],
  'Agriculture':['Agronomy','Horticulture','Soil Science'],
  'Education (B.Ed)':['Pedagogy','Educational Psychology'],
  'Polytechnic':['Mechanical (Diploma)','Civil (Diploma)','EEE (Diploma)','ECE (Diploma)','Computer Engineering (Diploma)']
};
export const SUBJECTS = {
  'Mechanical':['Thermodynamics','Fluid Mechanics','Strength of Materials','CAD/CAM','Heat Transfer','Manufacturing Technology','Kinematics of Machinery','Design of Machine Elements'],
  'CSE':['Data Structures','DBMS','Operating Systems','Machine Learning','Computer Networks','Python Programming','Compiler Design','Cloud Computing'],
  'IT':['Web Technology','DBMS','Software Engineering','Computer Networks','Java Programming'],
  'AI & DS':['Machine Learning','Deep Learning','Data Analytics','Python Programming','Big Data','Statistics for Data Science'],
  'AI & ML':['Machine Learning','Deep Learning','Natural Language Processing','Computer Vision','Python Programming'],
  'Civil':['Surveying','Structural Analysis','Concrete Technology','Geotechnical Engineering','Environmental Engineering'],
  'ECE':['Digital Electronics','Signals & Systems','VLSI Design','Embedded Systems','Communication Systems'],
  'EEE':['Electrical Machines','Power Systems','Control Systems','Power Electronics'],
  'Marketing':['Marketing Management','Digital Marketing','Consumer Behaviour','Sales & Distribution','Brand Management'],
  'Finance':['Financial Management','Accounting for Managers','Investment Analysis','Corporate Finance'],
  'HR':['Human Resource Management','Organisational Behaviour','Labour Laws','Training & Development'],
  'English':['British Literature','Communication Skills','Linguistics','American Literature'],
  'Mathematics':['Engineering Mathematics','Linear Algebra','Probability & Statistics','Discrete Mathematics'],
  'Commerce':['Financial Accounting','Cost Accounting','Business Law','Income Tax'],
  'Tamil':['Tamil Literature','Ilakkanam (Grammar)','Modern Tamil Prose','Translation Studies'],
  'Physics':['Mechanics','Optics','Quantum Mechanics','Electronics'],
  'Chemistry':['Organic Chemistry','Inorganic Chemistry','Physical Chemistry','Analytical Chemistry'],
  'Computer Science':['Python Programming','Data Structures','Web Technology','DBMS','Java Programming'],
  'BCA':['C Programming','Web Technology','DBMS','Software Engineering'],
  'Commerce (CA)':['Financial Accounting','Tally & GST','E-Commerce','Cost Accounting'],
  'Economics':['Microeconomics','Macroeconomics','Indian Economy','Econometrics'],
  'Psychology':['General Psychology','Developmental Psychology','Counselling Psychology'],
  'Visual Communication':['Photography','Graphic Design','Film Studies','Advertising'],
  'Biotechnology':['Genetics','Molecular Biology','Bioprocess Technology'],
  'Microbiology':['General Microbiology','Immunology','Medical Microbiology'],
  'Pharmaceutics':['Physical Pharmaceutics','Industrial Pharmacy','Biopharmaceutics'],
  'Pharmacology':['General Pharmacology','Toxicology','Clinical Pharmacology'],
  'Pharmaceutical Chemistry':['Medicinal Chemistry','Pharmaceutical Analysis'],
  'Medical-Surgical Nursing':['Adult Health Nursing','Critical Care Nursing','Nursing Foundations'],
  'Community Health Nursing':['Community Health Nursing','Epidemiology','Nutrition'],
  'Science & Humanities':['Engineering Mathematics','Engineering Physics','Engineering Chemistry','Communicative English'],
  'Operations':['Operations Management','Supply Chain Management','Project Management'],
  'Business Analytics':['Business Analytics','Data Visualisation','Business Statistics'],
  'Entrepreneurship':['Entrepreneurship Development','Startup Management','Innovation Management']
};
export const DESIGNATIONS = ['Assistant Professor','Associate Professor','Professor','HOD','Dean','Director','Principal','Vice-Principal','Lab Instructor','Training & Placement Officer'];
export const COORD_ROLES = ['Event coordinator','Placement coordinator','ERP coordinator','Exam cell coordinator','Admissions coordinator','IQAC coordinator','Timetable coordinator','Class advisor / mentor','Hostel warden','NSS / NCC officer','Sports coordinator','Alumni coordinator','Research / R&D coordinator','IIC coordinator','Training coordinator','None'];
export const ACCR_BODIES = ['NAAC','NBA','NIRF','QS I-GAUGE','QS Rankings','ARIIA / Innovation ranking','AICTE approval','UGC autonomy','ISO','Other'];
export const AI_TOOLS = ['ChatGPT','Claude','Gemini','Microsoft Copilot','Perplexity','Canva AI','Midjourney','NotebookLM','Gamma','Grammarly','Other'];
export const AI_PURPOSES = ['Email writing','Lesson / lecture planning','Question paper creation','Content writing','Image generation','Presentation making','Research & literature review','Data analysis','Coding','Video creation','Student assessment & feedback','Admin work'];
export const AI_LEVELS = [['Beginner','I have tried it for simple tasks.'],['Proficient','I use it regularly for my teaching or office work.'],['Advanced','I use it for complex work and can teach colleagues.'],['Distinguished','I build workflows, train others and have recognised outputs.']];
export const TRAITS = {CA:'Calm authority',SC:'Student-centricity',IN:'Integrity',CO:'Collaboration',OW:'Ownership',PR:'Process orientation',RE:'Resilience'};
export const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export const STEPS = [
  ['Personal details','Tell us who you are.'],
  ['Location & relocation','Where you live now, and where you would move for the right role.'],
  ['Education','Your degrees, doctorate and eligibility tests.'],
  ['Area of interest','Choose the institution type, then the department, then the subjects you teach best.'],
  ['Experience & salary','Where you have worked and what you expect.'],
  ['Additional roles','Responsibilities beyond teaching, with how long you held them.'],
  ['Accreditation work','NAAC, NBA, NIRF, QS I-GAUGE and similar work.'],
  ['Research','Publications and PhD guideship.'],
  ['Industry & startups','Industry projects and startup mentoring.'],
  ['AI skills','The AI tools you use, what for, and how well.'],
  ['Personality assessment','10 short workplace scenarios. Choose what you would really do.'],
  ['Voice & video intro','Introduce yourself in your own words.'],
  ['Documents & consent','Upload your resume and choose who can see your profile.']
];

/* Core domain compatibility rules: restricts selecting unrelated domains */
export const DOMAIN_COMPATIBILITY = {
  'Engineering & Technology': ['Engineering & Technology', 'Polytechnic', 'Arts & Science', 'Management (MBA/BBA)', 'Architecture'],
  'Polytechnic': ['Polytechnic', 'Engineering & Technology'],
  'Architecture': ['Architecture', 'Engineering & Technology'],
  'Arts & Science': ['Arts & Science', 'Management (MBA/BBA)', 'Engineering & Technology', 'Education (B.Ed)'],
  'Management (MBA/BBA)': ['Management (MBA/BBA)', 'Engineering & Technology', 'Arts & Science'],
  'Nursing': ['Nursing', 'Allied Health Sciences'],
  'Pharmacy': ['Pharmacy', 'Allied Health Sciences'],
  'Physiotherapy': ['Physiotherapy', 'Allied Health Sciences'],
  'Occupational Therapy': ['Occupational Therapy', 'Allied Health Sciences'],
  'Allied Health Sciences': ['Allied Health Sciences', 'Nursing', 'Pharmacy', 'Physiotherapy', 'Occupational Therapy'],
  'Law': ['Law'],
  'Agriculture': ['Agriculture'],
  'Education (B.Ed)': ['Education (B.Ed)', 'Arts & Science']
};

export function isDomainAllowed(selectedDomains, candidateDomain) {
  if (!selectedDomains || !selectedDomains.length) return true;
  if (selectedDomains.includes(candidateDomain)) return true;
  return selectedDomains.every(s => (DOMAIN_COMPATIBILITY[s] || []).includes(candidateDomain));
}

