import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  "en-US": {
    translation: {
      dashboard: "Dashboard",
      settings: "Settings",
      account: "Account",
      notifications: "Notifications",
      privacy: "Privacy",
      preferences: "Preferences",
      save: "Save",
      cancel: "Cancel",
      logout: "Logout",
      profile: "Profile",
      my_profile: "My Profile",
      home: "Home",
      courses: "Courses",
      assessments: "Assessments",
      jobs: "Jobs",
      applications: "Applications",
      interviews: "Interviews",
      reports: "Reports",
      messages: "Messages",
      help: "Help",
      search: "Search",
      submit: "Submit",
      edit: "Edit",
      delete: "Delete",
      close: "Close",
      back: "Back",
      next: "Next",
      previous: "Previous",
      loading: "Loading...",
      welcome: "Welcome",

      achievements: "Achievements",
      tasks_deadlines: "Tasks & Deadlines",
      recommendations: "Recommendations",
      community: "Community",
      insights: "Insights",
      engagement_trends: "Engagement Trends",
      gap_report: "Gap Report",
      job_applications: "Job Applications",
      learners: "Learners",
      announcements: "Announcements",
      job_listings: "Job Listings",
      certificate_validation: "Certificate Validation",
      candidates: "Candidates",
      analytics: "Analytics",
      user_management: "User Management",
      user_details: "User Details",
      subscriptions: "Subscriptions",

      skill_platform: "Skill Platform",
      close_menu: "Close menu",
      open_menu: "Open menu",
      signed_in_as: "Signed in as",
      guest: "Guest",

      education_saas_dashboard: "Education SaaS Dashboard",
      search_courses_skills_candidates:
        "Search courses, skills, candidates…",
      searching: "Searching...",
      no_results_for: "No results found for",
      members: "Members",
      student: "Student",
      remove_request: "Remove Request",
      connect: "Connect",
      latest_5: "Latest 5",
      loading_notifications: "Loading notifications...",
      unable_to_load_notifications:
        "Unable to load notifications.",
      no_notifications: "No notifications",

      connection_request_sent:
        "Connection request sent!",
      failed_to_send_request:
        "Failed to send request",
      request_cancelled: "Request cancelled",
      failed_to_cancel_request:
        "Failed to cancel request",

      welcome_employer:
        "Welcome back, {{name}} — find and connect with top candidates.",
      welcome_educator:
        "Welcome back, {{name}} — manage courses and inspire learners.",
      welcome_student:
        "Welcome back, {{name}} — let's close those skill gaps.",

      manage_account_description:
        "Manage your account information and preferences.",
      profile_visibility: "Profile Visibility",
      visible_to_all_classmates:
        "Visible to all classmates",
      private: "Private",
      public: "Public",
      email_address: "Email Address",
      email_read_only: "Email address cannot be changed here.",
      change_password: "Change Password",
      password_reset_coming_soon:
        "Password reset will be available soon.",
      change: "Change",

      enable_dark_mode: "Enable Dark Mode",
      dark_mode_description:
        "Use dark mode throughout the application.",
      learning_reminders: "Learning Reminders",
      receive_task_reminders:
        "Receive reminders about your tasks and deadlines.",

      language: "Language",
      choose_preferred_language:
        "Choose your preferred language.",
      selected_language: "Selected Language",
      time_zone: "Time Zone",

      weekly_digest_email: "Weekly Digest Email",
      progress_recommendations:
        "Progress Recommendations",
      upcoming_task_notifications:
        "Upcoming Task Notifications",
      show_activity_classmates:
        "Show my activity to classmates",
      recent_submissions_comments:
        "Show recent submissions and comments",
      show_progress_leaderboards:
        "Show progress leaderboards",

      theme: "Theme",
      choose_application_appearance:
        "Choose your application appearance.",
      light: "Light",
      dark: "Dark",

      changes_saved_successfully:
        "Changes saved successfully.",
      failed_to_save_changes:
        "Failed to save changes.",
      save_changes: "Save Changes"
    }
  },

  "en-GB": {
    translation: {
      dashboard: "Dashboard",
      settings: "Settings",
      account: "Account",
      notifications: "Notifications",
      privacy: "Privacy",
      preferences: "Preferences",
      save: "Save",
      cancel: "Cancel",
      logout: "Log out",
      profile: "Profile",
      my_profile: "My Profile",
      home: "Home",
      courses: "Courses",
      assessments: "Assessments",
      jobs: "Jobs",
      applications: "Applications",
      interviews: "Interviews",
      reports: "Reports",
      messages: "Messages",
      help: "Help",
      search: "Search",
      submit: "Submit",
      edit: "Edit",
      delete: "Delete",
      close: "Close",
      back: "Back",
      next: "Next",
      previous: "Previous",
      loading: "Loading...",
      welcome: "Welcome",

      achievements: "Achievements",
      tasks_deadlines: "Tasks & Deadlines",
      recommendations: "Recommendations",
      community: "Community",
      insights: "Insights",
      engagement_trends: "Engagement Trends",
      gap_report: "Gap Report",
      job_applications: "Job Applications",
      learners: "Learners",
      announcements: "Announcements",
      job_listings: "Job Listings",
      certificate_validation: "Certificate Validation",
      candidates: "Candidates",
      analytics: "Analytics",
      user_management: "User Management",
      user_details: "User Details",
      subscriptions: "Subscriptions",

      skill_platform: "Skill Platform",
      close_menu: "Close menu",
      open_menu: "Open menu",
      signed_in_as: "Signed in as",
      guest: "Guest",

      education_saas_dashboard: "Education SaaS Dashboard",
      search_courses_skills_candidates:
        "Search courses, skills, candidates…",
      searching: "Searching...",
      no_results_for: "No results found for",
      members: "Members",
      student: "Student",
      remove_request: "Remove Request",
      connect: "Connect",
      latest_5: "Latest 5",
      loading_notifications: "Loading notifications...",
      unable_to_load_notifications:
        "Unable to load notifications.",
      no_notifications: "No notifications",

      connection_request_sent:
        "Connection request sent!",
      failed_to_send_request:
        "Failed to send request",
      request_cancelled: "Request cancelled",
      failed_to_cancel_request:
        "Failed to cancel request",

      welcome_employer:
        "Welcome back, {{name}} — find and connect with top candidates.",
      welcome_educator:
        "Welcome back, {{name}} — manage courses and inspire learners.",
      welcome_student:
        "Welcome back, {{name}} — let's close those skill gaps.",

      manage_account_description:
        "Manage your account information and preferences.",
      profile_visibility: "Profile Visibility",
      visible_to_all_classmates:
        "Visible to all classmates",
      private: "Private",
      public: "Public",
      email_address: "Email Address",
      email_read_only: "Email address cannot be changed here.",
      change_password: "Change Password",
      password_reset_coming_soon:
        "Password reset will be available soon.",
      change: "Change",

      enable_dark_mode: "Enable Dark Mode",
      dark_mode_description:
        "Use dark mode throughout the application.",
      learning_reminders: "Learning Reminders",
      receive_task_reminders:
        "Receive reminders about your tasks and deadlines.",

      language: "Language",
      choose_preferred_language:
        "Choose your preferred language.",
      selected_language: "Selected Language",
      time_zone: "Time Zone",

      weekly_digest_email: "Weekly Digest Email",
      progress_recommendations:
        "Progress Recommendations",
      upcoming_task_notifications:
        "Upcoming Task Notifications",
      show_activity_classmates:
        "Show my activity to classmates",
      recent_submissions_comments:
        "Show recent submissions and comments",
      show_progress_leaderboards:
        "Show progress leaderboards",

      theme: "Theme",
      choose_application_appearance:
        "Choose your application appearance.",
      light: "Light",
      dark: "Dark",

      changes_saved_successfully:
        "Changes saved successfully.",
      failed_to_save_changes:
        "Failed to save changes.",
      save_changes: "Save Changes"
    }
  },

  "hi-IN": {
    translation: {
      dashboard: "डैशबोर्ड",
      settings: "सेटिंग्स",
      account: "खाता",
      notifications: "सूचनाएं",
      privacy: "गोपनीयता",
      preferences: "प्राथमिकताएं",
      save: "सहेजें",
      cancel: "रद्द करें",
      logout: "लॉग आउट",
      profile: "प्रोफ़ाइल",
      my_profile: "मेरी प्रोफ़ाइल",
      home: "होम",
      courses: "पाठ्यक्रम",
      assessments: "मूल्यांकन",
      jobs: "नौकरियां",
      applications: "आवेदन",
      interviews: "साक्षात्कार",
      reports: "रिपोर्ट",
      messages: "संदेश",
      help: "मदद",
      search: "खोजें",
      submit: "जमा करें",
      edit: "संपादित करें",
      delete: "हटाएं",
      close: "बंद करें",
      back: "वापस",
      next: "अगला",
      previous: "पिछला",
      loading: "लोड हो रहा है...",
      welcome: "स्वागत है",

      achievements: "उपलब्धियां",
      tasks_deadlines: "कार्य और समय-सीमाएं",
      recommendations: "सुझाव",
      community: "समुदाय",
      insights: "अंतर्दृष्टि",
      engagement_trends: "सक्रियता रुझान",
      gap_report: "स्किल गैप रिपोर्ट",
      job_applications: "नौकरी आवेदन",
      learners: "शिक्षार्थी",
      announcements: "घोषणाएं",
      job_listings: "नौकरी सूची",
      certificate_validation: "प्रमाणपत्र सत्यापन",
      candidates: "उम्मीदवार",
      analytics: "विश्लेषण",
      user_management: "उपयोगकर्ता प्रबंधन",
      user_details: "उपयोगकर्ता विवरण",
      subscriptions: "सदस्यताएं",

      skill_platform: "स्किल प्लेटफ़ॉर्म",
      close_menu: "मेनू बंद करें",
      open_menu: "मेनू खोलें",
      signed_in_as: "इस रूप में साइन इन",
      guest: "अतिथि",

      education_saas_dashboard:
        "एजुकेशन SaaS डैशबोर्ड",
      search_courses_skills_candidates:
        "पाठ्यक्रम, कौशल, उम्मीदवार खोजें…",
      searching: "खोजा जा रहा है...",
      no_results_for: "इसके लिए कोई परिणाम नहीं मिला",
      members: "सदस्य",
      student: "विद्यार्थी",
      remove_request: "अनुरोध हटाएं",
      connect: "कनेक्ट करें",
      latest_5: "नवीनतम 5",
      loading_notifications:
        "सूचनाएं लोड हो रही हैं...",
      unable_to_load_notifications:
        "सूचनाएं लोड नहीं हो सकीं।",
      no_notifications: "कोई सूचना नहीं",

      connection_request_sent:
        "कनेक्शन अनुरोध भेज दिया गया!",
      failed_to_send_request:
        "अनुरोध भेजने में विफल",
      request_cancelled: "अनुरोध रद्द कर दिया गया",
      failed_to_cancel_request:
        "अनुरोध रद्द करने में विफल",

      welcome_employer:
        "वापसी पर स्वागत है, {{name}} — शीर्ष उम्मीदवारों को खोजें और उनसे जुड़ें।",
      welcome_educator:
        "वापसी पर स्वागत है, {{name}} — पाठ्यक्रम प्रबंधित करें और शिक्षार्थियों को प्रेरित करें।",
      welcome_student:
        "वापसी पर स्वागत है, {{name}} — अपने स्किल गैप को कम करें।",

      manage_account_description:
        "अपने खाते की जानकारी और प्राथमिकताओं को प्रबंधित करें।",
      profile_visibility: "प्रोफ़ाइल दृश्यता",
      visible_to_all_classmates:
        "सभी सहपाठियों को दिखाई देगा",
      private: "निजी",
      public: "सार्वजनिक",
      email_address: "ईमेल पता",
      email_read_only:
        "ईमेल पता यहां बदला नहीं जा सकता।",
      change_password: "पासवर्ड बदलें",
      password_reset_coming_soon:
        "पासवर्ड रीसेट सुविधा जल्द उपलब्ध होगी।",
      change: "बदलें",

      enable_dark_mode: "डार्क मोड सक्षम करें",
      dark_mode_description:
        "पूरे एप्लिकेशन में डार्क मोड का उपयोग करें।",
      learning_reminders: "लर्निंग रिमाइंडर",
      receive_task_reminders:
        "अपने कार्यों और समय-सीमाओं के बारे में रिमाइंडर प्राप्त करें।",

      language: "भाषा",
      choose_preferred_language:
        "अपनी पसंदीदा भाषा चुनें।",
      selected_language: "चयनित भाषा",
      time_zone: "समय क्षेत्र",

      weekly_digest_email: "साप्ताहिक सारांश ईमेल",
      progress_recommendations:
        "प्रगति सुझाव",
      upcoming_task_notifications:
        "आगामी कार्य सूचनाएं",
      show_activity_classmates:
        "मेरी गतिविधि सहपाठियों को दिखाएं",
      recent_submissions_comments:
        "हाल की सबमिशन और टिप्पणियां दिखाएं",
      show_progress_leaderboards:
        "प्रगति लीडरबोर्ड दिखाएं",

      theme: "थीम",
      choose_application_appearance:
        "अपने एप्लिकेशन का रूप चुनें।",
      light: "लाइट",
      dark: "डार्क",

      changes_saved_successfully:
        "परिवर्तन सफलतापूर्वक सहेजे गए।",
      failed_to_save_changes:
        "परिवर्तन सहेजने में विफल।",
      save_changes: "परिवर्तन सहेजें"
    }
  },

  "te-IN": {
    translation: {
      dashboard: "డాష్‌బోర్డ్",
      settings: "సెట్టింగ్స్",
      account: "ఖాతా",
      notifications: "నోటిఫికేషన్లు",
      privacy: "గోప్యత",
      preferences: "ప్రాధాన్యతలు",
      save: "సేవ్ చేయండి",
      cancel: "రద్దు చేయండి",
      logout: "లాగ్ అవుట్",
      profile: "ప్రొఫైల్",
      my_profile: "నా ప్రొఫైల్",
      home: "హోమ్",
      courses: "కోర్సులు",
      assessments: "అసెస్‌మెంట్స్",
      jobs: "ఉద్యోగాలు",
      applications: "దరఖాస్తులు",
      interviews: "ఇంటర్వ్యూలు",
      reports: "నివేదికలు",
      messages: "సందేశాలు",
      help: "సహాయం",
      search: "వెతకండి",
      submit: "సమర్పించండి",
      edit: "సవరించండి",
      delete: "తొలగించండి",
      close: "మూసివేయండి",
      back: "వెనుకకు",
      next: "తదుపరి",
      previous: "మునుపటి",
      loading: "లోడ్ అవుతోంది...",
      welcome: "స్వాగతం",

      achievements: "విజయాలు",
      tasks_deadlines: "పనులు & గడువులు",
      recommendations: "సిఫార్సులు",
      community: "కమ్యూనిటీ",
      insights: "అంతర్దృష్టులు",
      engagement_trends: "ఎంగేజ్‌మెంట్ ట్రెండ్స్",
      gap_report: "స్కిల్ గ్యాప్ రిపోర్ట్",
      job_applications: "ఉద్యోగ దరఖాస్తులు",
      learners: "లెర్నర్స్",
      announcements: "ప్రకటనలు",
      job_listings: "ఉద్యోగ జాబితాలు",
      certificate_validation: "సర్టిఫికేట్ ధృవీకరణ",
      candidates: "అభ్యర్థులు",
      analytics: "విశ్లేషణలు",
      user_management: "యూజర్ నిర్వహణ",
      user_details: "యూజర్ వివరాలు",
      subscriptions: "సబ్‌స్క్రిప్షన్లు",

      skill_platform: "స్కిల్ ప్లాట్‌ఫారమ్",
      close_menu: "మెనూను మూసివేయండి",
      open_menu: "మెనూను తెరవండి",
      signed_in_as: "ఇలా సైన్ ఇన్ అయ్యారు",
      guest: "అతిథి",

      education_saas_dashboard:
        "ఎడ్యుకేషన్ SaaS డాష్‌బోర్డ్",
      search_courses_skills_candidates:
        "కోర్సులు, నైపుణ్యాలు, అభ్యర్థులను వెతకండి…",
      searching: "వెతుకుతోంది...",
      no_results_for: "ఫలితాలు కనుగొనబడలేదు",
      members: "సభ్యులు",
      student: "విద్యార్థి",
      remove_request: "రిక్వెస్ట్ తొలగించండి",
      connect: "కనెక్ట్ చేయండి",
      latest_5: "ఇటీవలి 5",
      loading_notifications:
        "నోటిఫికేషన్లు లోడ్ అవుతున్నాయి...",
      unable_to_load_notifications:
        "నోటిఫికేషన్లు లోడ్ చేయడం సాధ్యపడలేదు.",
      no_notifications:
        "నోటిఫికేషన్లు ఏవీ లేవు",

      connection_request_sent:
        "కనెక్షన్ రిక్వెస్ట్ పంపబడింది!",
      failed_to_send_request:
        "రిక్వెస్ట్ పంపడం విఫలమైంది",
      request_cancelled:
        "రిక్వెస్ట్ రద్దు చేయబడింది",
      failed_to_cancel_request:
        "రిక్వెస్ట్ రద్దు చేయడం విఫలమైంది",

      welcome_employer:
        "తిరిగి స్వాగతం, {{name}} — ప్రముఖ అభ్యర్థులను కనుగొని కనెక్ట్ అవ్వండి.",
      welcome_educator:
        "తిరిగి స్వాగతం, {{name}} — కోర్సులను నిర్వహించి లెర్నర్స్‌కు ప్రేరణ ఇవ్వండి.",
      welcome_student:
        "తిరిగి స్వాగతం, {{name}} — మీ స్కిల్ గ్యాప్‌లను తగ్గించుకుందాం.",

      manage_account_description:
        "మీ ఖాతా సమాచారం మరియు ప్రాధాన్యతలను నిర్వహించండి.",
      profile_visibility: "ప్రొఫైల్ విజిబిలిటీ",
      visible_to_all_classmates:
        "అందరు సహ విద్యార్థులకు కనిపిస్తుంది",
      private: "ప్రైవేట్",
      public: "పబ్లిక్",
      email_address: "ఇమెయిల్ చిరునామా",
      email_read_only:
        "ఇమెయిల్ చిరునామాను ఇక్కడ మార్చలేరు.",
      change_password: "పాస్‌వర్డ్ మార్చండి",
      password_reset_coming_soon:
        "పాస్‌వర్డ్ రీసెట్ త్వరలో అందుబాటులోకి వస్తుంది.",
      change: "మార్చండి",

      enable_dark_mode: "డార్క్ మోడ్‌ను ప్రారంభించండి",
      dark_mode_description:
        "అప్లికేషన్ అంతటా డార్క్ మోడ్ ఉపయోగించండి.",
      learning_reminders: "లెర్నింగ్ రిమైండర్లు",
      receive_task_reminders:
        "మీ పనులు మరియు గడువుల గురించి రిమైండర్లు పొందండి.",

      language: "భాష",
      choose_preferred_language:
        "మీకు ఇష్టమైన భాషను ఎంచుకోండి.",
      selected_language: "ఎంచుకున్న భాష",
      time_zone: "సమయ మండలం",

      weekly_digest_email:
        "వారపు డైజెస్ట్ ఇమెయిల్",
      progress_recommendations:
        "ప్రగతి సిఫార్సులు",
      upcoming_task_notifications:
        "రాబోయే పనుల నోటిఫికేషన్లు",
      show_activity_classmates:
        "నా కార్యకలాపాలను సహ విద్యార్థులకు చూపించండి",
      recent_submissions_comments:
        "ఇటీవలి సమర్పణలు మరియు వ్యాఖ్యలను చూపించండి",
      show_progress_leaderboards:
        "ప్రగతి లీడర్‌బోర్డులను చూపించండి",

      theme: "థీమ్",
      choose_application_appearance:
        "అప్లికేషన్ రూపాన్ని ఎంచుకోండి.",
      light: "లైట్",
      dark: "డార్క్",

      changes_saved_successfully:
        "మార్పులు విజయవంతంగా సేవ్ చేయబడ్డాయి.",
      failed_to_save_changes:
        "మార్పులను సేవ్ చేయడం విఫలమైంది.",
      save_changes: "మార్పులను సేవ్ చేయండి"
    }
  },

  "ta-IN": {
    translation: {
      dashboard: "டாஷ்போர்டு",
      settings: "அமைப்புகள்",
      account: "கணக்கு",
      notifications: "அறிவிப்புகள்",
      privacy: "தனியுரிமை",
      preferences: "விருப்பத்தேர்வுகள்",
      save: "சேமிக்கவும்",
      cancel: "ரத்து செய்யவும்",
      logout: "வெளியேறு",
      profile: "சுயவிவரம்",
      my_profile: "எனது சுயவிவரம்",
      home: "முகப்பு",
      courses: "பாடநெறிகள்",
      assessments: "மதிப்பீடுகள்",
      jobs: "வேலைகள்",
      applications: "விண்ணப்பங்கள்",
      interviews: "நேர்காணல்கள்",
      reports: "அறிக்கைகள்",
      messages: "செய்திகள்",
      help: "உதவி",
      search: "தேடல்",
      submit: "சமர்ப்பிக்கவும்",
      edit: "திருத்தவும்",
      delete: "நீக்கவும்",
      close: "மூடவும்",
      back: "பின்செல்",
      next: "அடுத்து",
      previous: "முந்தைய",
      loading: "ஏற்றப்படுகிறது...",
      welcome: "வரவேற்கிறோம்",

      achievements: "சாதனைகள்",
      tasks_deadlines: "பணிகள் மற்றும் காலக்கெடுக்கள்",
      recommendations: "பரிந்துரைகள்",
      community: "சமூகம்",
      insights: "நுண்ணறிவுகள்",
      engagement_trends: "ஈடுபாட்டு போக்குகள்",
      gap_report: "திறன் இடைவெளி அறிக்கை",
      job_applications: "வேலை விண்ணப்பங்கள்",
      learners: "கற்றவர்கள்",
      announcements: "அறிவிப்புகள்",
      job_listings: "வேலை பட்டியல்கள்",
      certificate_validation: "சான்றிதழ் சரிபார்ப்பு",
      candidates: "விண்ணப்பதாரர்கள்",
      analytics: "பகுப்பாய்வு",
      user_management: "பயனர் மேலாண்மை",
      user_details: "பயனர் விவரங்கள்",
      subscriptions: "சந்தாக்கள்",

      skill_platform: "திறன் தளம்",
      close_menu: "மெனுவை மூடவும்",
      open_menu: "மெனுவைத் திறக்கவும்",
      signed_in_as: "உள்நுழைந்துள்ள நிலை",
      guest: "விருந்தினர்",

      education_saas_dashboard:
        "கல்வி SaaS டாஷ்போர்டு",
      search_courses_skills_candidates:
        "பாடநெறிகள், திறன்கள், விண்ணப்பதாரர்களைத் தேடுங்கள்…",
      searching: "தேடுகிறது...",
      no_results_for: "முடிவுகள் எதுவும் கிடைக்கவில்லை",
      members: "உறுப்பினர்கள்",
      student: "மாணவர்",
      remove_request: "கோரிக்கையை அகற்றவும்",
      connect: "இணைக்கவும்",
      latest_5: "சமீபத்திய 5",
      loading_notifications:
        "அறிவிப்புகள் ஏற்றப்படுகின்றன...",
      unable_to_load_notifications:
        "அறிவிப்புகளை ஏற்ற முடியவில்லை.",
      no_notifications:
        "அறிவிப்புகள் எதுவும் இல்லை",

      connection_request_sent:
        "இணைப்பு கோரிக்கை அனுப்பப்பட்டது!",
      failed_to_send_request:
        "கோரிக்கையை அனுப்ப முடியவில்லை",
      request_cancelled:
        "கோரிக்கை ரத்து செய்யப்பட்டது",
      failed_to_cancel_request:
        "கோரிக்கையை ரத்து செய்ய முடியவில்லை",

      welcome_employer:
        "மீண்டும் வரவேற்கிறோம், {{name}} — சிறந்த விண்ணப்பதாரர்களைக் கண்டுபிடித்து இணைக்கவும்.",
      welcome_educator:
        "மீண்டும் வரவேற்கிறோம், {{name}} — பாடநெறிகளை நிர்வகித்து கற்றவர்களை ஊக்குவிக்கவும்.",
      welcome_student:
        "மீண்டும் வரவேற்கிறோம், {{name}} — உங்கள் திறன் இடைவெளிகளை குறைப்போம்.",

      manage_account_description:
        "உங்கள் கணக்கு தகவல் மற்றும் விருப்பத்தேர்வுகளை நிர்வகிக்கவும்.",
      profile_visibility: "சுயவிவரத் தெரிவுநிலை",
      visible_to_all_classmates:
        "அனைத்து வகுப்பு நண்பர்களுக்கும் தெரியும்",
      private: "தனிப்பட்டது",
      public: "பொதுவானது",
      email_address: "மின்னஞ்சல் முகவரி",
      email_read_only:
        "மின்னஞ்சல் முகவரியை இங்கே மாற்ற முடியாது.",
      change_password: "கடவுச்சொல்லை மாற்றவும்",
      password_reset_coming_soon:
        "கடவுச்சொல் மீட்டமைப்பு விரைவில் கிடைக்கும்.",
      change: "மாற்றவும்",

      enable_dark_mode: "டார்க் மோடை இயக்கவும்",
      dark_mode_description:
        "முழு பயன்பாட்டிலும் டார்க் மோடைப் பயன்படுத்தவும்.",
      learning_reminders: "கற்றல் நினைவூட்டல்கள்",
      receive_task_reminders:
        "உங்கள் பணிகள் மற்றும் காலக்கெடுக்கள் பற்றிய நினைவூட்டல்களைப் பெறவும்.",

      language: "மொழி",
      choose_preferred_language:
        "உங்களுக்கு விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்.",
      selected_language: "தேர்ந்தெடுக்கப்பட்ட மொழி",
      time_zone: "நேர மண்டலம்",

      weekly_digest_email:
        "வாராந்திர சுருக்க மின்னஞ்சல்",
      progress_recommendations:
        "முன்னேற்ற பரிந்துரைகள்",
      upcoming_task_notifications:
        "வரவிருக்கும் பணி அறிவிப்புகள்",
      show_activity_classmates:
        "எனது செயல்பாடுகளை வகுப்பு நண்பர்களுக்குக் காட்டவும்",
      recent_submissions_comments:
        "சமீபத்திய சமர்ப்பிப்புகள் மற்றும் கருத்துகளைக் காட்டவும்",
      show_progress_leaderboards:
        "முன்னேற்ற தரவரிசைகளைக் காட்டவும்",

      theme: "தீம்",
      choose_application_appearance:
        "பயன்பாட்டின் தோற்றத்தைத் தேர்ந்தெடுக்கவும்.",
      light: "லைட்",
      dark: "டார்க்",

      changes_saved_successfully:
        "மாற்றங்கள் வெற்றிகரமாக சேமிக்கப்பட்டன.",
      failed_to_save_changes:
        "மாற்றங்களைச் சேமிக்க முடியவில்லை.",
      save_changes: "மாற்றங்களைச் சேமிக்கவும்"
    }
  },

  "kn-IN": {
    translation: {
      dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
      account: "ಖಾತೆ",
      notifications: "ಅಧಿಸೂಚನೆಗಳು",
      privacy: "ಗೌಪ್ಯತೆ",
      preferences: "ಆದ್ಯತೆಗಳು",
      save: "ಉಳಿಸಿ",
      cancel: "ರದ್ದುಮಾಡಿ",
      logout: "ಲಾಗ್ ಔಟ್",
      profile: "ಪ್ರೊಫೈಲ್",
      my_profile: "ನನ್ನ ಪ್ರೊಫೈಲ್",
      home: "ಮುಖಪುಟ",
      courses: "ಕೋರ್ಸ್‌ಗಳು",
      assessments: "ಮೌಲ್ಯಮಾಪನಗಳು",
      jobs: "ಉದ್ಯೋಗಗಳು",
      applications: "ಅರ್ಜಿಗಳು",
      interviews: "ಸಂದರ್ಶನಗಳು",
      reports: "ವರದಿಗಳು",
      messages: "ಸಂದೇಶಗಳು",
      help: "ಸಹಾಯ",
      search: "ಹುಡುಕಿ",
      submit: "ಸಲ್ಲಿಸಿ",
      edit: "ತಿದ್ದು",
      delete: "ಅಳಿಸಿ",
      close: "ಮುಚ್ಚಿ",
      back: "ಹಿಂದಕ್ಕೆ",
      next: "ಮುಂದೆ",
      previous: "ಹಿಂದಿನ",
      loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
      welcome: "ಸ್ವಾಗತ",

      achievements: "ಸಾಧನೆಗಳು",
      tasks_deadlines: "ಕಾರ್ಯಗಳು ಮತ್ತು ಗಡುವುಗಳು",
      recommendations: "ಶಿಫಾರಸುಗಳು",
      community: "ಸಮುದಾಯ",
      insights: "ಒಳನೋಟಗಳು",
      engagement_trends: "ತೊಡಗಿಸಿಕೊಳ್ಳುವಿಕೆ ಪ್ರವೃತ್ತಿಗಳು",
      gap_report: "ಕೌಶಲ್ಯ ಅಂತರ ವರದಿ",
      job_applications: "ಉದ್ಯೋಗ ಅರ್ಜಿಗಳು",
      learners: "ಕಲಿಯುವವರು",
      announcements: "ಪ್ರಕಟನೆಗಳು",
      job_listings: "ಉದ್ಯೋಗ ಪಟ್ಟಿಗಳು",
      certificate_validation: "ಪ್ರಮಾಣಪತ್ರ ಪರಿಶೀಲನೆ",
      candidates: "ಅಭ್ಯರ್ಥಿಗಳು",
      analytics: "ವಿಶ್ಲೇಷಣೆ",
      user_management: "ಬಳಕೆದಾರ ನಿರ್ವಹಣೆ",
      user_details: "ಬಳಕೆದಾರ ವಿವರಗಳು",
      subscriptions: "ಚಂದಾದಾರಿಕೆಗಳು",

      skill_platform: "ಸ್ಕಿಲ್ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್",
      close_menu: "ಮೆನು ಮುಚ್ಚಿ",
      open_menu: "ಮೆನು ತೆರೆಯಿರಿ",
      signed_in_as: "ಈ ಹೆಸರಿನಲ್ಲಿ ಸೈನ್ ಇನ್ ಆಗಿದ್ದೀರಿ",
      guest: "ಅತಿಥಿ",

      education_saas_dashboard:
        "ಎಜುಕೇಶನ್ SaaS ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      search_courses_skills_candidates:
        "ಕೋರ್ಸ್‌ಗಳು, ಕೌಶಲ್ಯಗಳು, ಅಭ್ಯರ್ಥಿಗಳನ್ನು ಹುಡುಕಿ…",
      searching: "ಹುಡುಕಲಾಗುತ್ತಿದೆ...",
      no_results_for: "ಯಾವುದೇ ಫಲಿತಾಂಶಗಳು ಕಂಡುಬಂದಿಲ್ಲ",
      members: "ಸದಸ್ಯರು",
      student: "ವಿದ್ಯಾರ್ಥಿ",
      remove_request: "ವಿನಂತಿಯನ್ನು ತೆಗೆದುಹಾಕಿ",
      connect: "ಸಂಪರ್ಕಿಸಿ",
      latest_5: "ಇತ್ತೀಚಿನ 5",
      loading_notifications:
        "ಅಧಿಸೂಚನೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
      unable_to_load_notifications:
        "ಅಧಿಸೂಚನೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
      no_notifications:
        "ಯಾವುದೇ ಅಧಿಸೂಚನೆಗಳಿಲ್ಲ",

      connection_request_sent:
        "ಸಂಪರ್ಕ ವಿನಂತಿಯನ್ನು ಕಳುಹಿಸಲಾಗಿದೆ!",
      failed_to_send_request:
        "ವಿನಂತಿಯನ್ನು ಕಳುಹಿಸಲು ವಿಫಲವಾಗಿದೆ",
      request_cancelled:
        "ವಿನಂತಿಯನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ",
      failed_to_cancel_request:
        "ವಿನಂತಿಯನ್ನು ರದ್ದುಗೊಳಿಸಲು ವಿಫಲವಾಗಿದೆ",

      welcome_employer:
        "ಮತ್ತೆ ಸ್ವಾಗತ, {{name}} — ಉತ್ತಮ ಅಭ್ಯರ್ಥಿಗಳನ್ನು ಹುಡುಕಿ ಮತ್ತು ಸಂಪರ್ಕಿಸಿ.",
      welcome_educator:
        "ಮತ್ತೆ ಸ್ವಾಗತ, {{name}} — ಕೋರ್ಸ್‌ಗಳನ್ನು ನಿರ್ವಹಿಸಿ ಮತ್ತು ಕಲಿಯುವವರನ್ನು ಪ್ರೇರೇಪಿಸಿ.",
      welcome_student:
        "ಮತ್ತೆ ಸ್ವಾಗತ, {{name}} — ನಿಮ್ಮ ಕೌಶಲ್ಯ ಅಂತರಗಳನ್ನು ಕಡಿಮೆ ಮಾಡೋಣ.",

      manage_account_description:
        "ನಿಮ್ಮ ಖಾತೆ ಮಾಹಿತಿ ಮತ್ತು ಆದ್ಯತೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ.",
      profile_visibility: "ಪ್ರೊಫೈಲ್ ಗೋಚರತೆ",
      visible_to_all_classmates:
        "ಎಲ್ಲಾ ಸಹಪಾಠಿಗಳಿಗೆ ಗೋಚರಿಸುತ್ತದೆ",
      private: "ಖಾಸಗಿ",
      public: "ಸಾರ್ವಜನಿಕ",
      email_address: "ಇಮೇಲ್ ವಿಳಾಸ",
      email_read_only:
        "ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ಇಲ್ಲಿ ಬದಲಾಯಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.",
      change_password: "ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾಯಿಸಿ",
      password_reset_coming_soon:
        "ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸುವಿಕೆ ಶೀಘ್ರದಲ್ಲೇ ಲಭ್ಯವಾಗಲಿದೆ.",
      change: "ಬದಲಾಯಿಸಿ",

      enable_dark_mode: "ಡಾರ್ಕ್ ಮೋಡ್ ಸಕ್ರಿಯಗೊಳಿಸಿ",
      dark_mode_description:
        "ಅಪ್ಲಿಕೇಶನ್‌ನಾದ್ಯಂತ ಡಾರ್ಕ್ ಮೋಡ್ ಬಳಸಿ.",
      learning_reminders: "ಕಲಿಕೆಯ ಜ್ಞಾಪನೆಗಳು",
      receive_task_reminders:
        "ನಿಮ್ಮ ಕಾರ್ಯಗಳು ಮತ್ತು ಗಡುವುಗಳ ಬಗ್ಗೆ ಜ್ಞಾಪನೆಗಳನ್ನು ಪಡೆಯಿರಿ.",

      language: "ಭಾಷೆ",
      choose_preferred_language:
        "ನಿಮಗೆ ಇಷ್ಟವಾದ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
      selected_language: "ಆಯ್ಕೆ ಮಾಡಿದ ಭಾಷೆ",
      time_zone: "ಸಮಯ ವಲಯ",

      weekly_digest_email:
        "ವಾರದ ಸಾರಾಂಶ ಇಮೇಲ್",
      progress_recommendations:
        "ಪ್ರಗತಿ ಶಿಫಾರಸುಗಳು",
      upcoming_task_notifications:
        "ಮುಂಬರುವ ಕಾರ್ಯ ಅಧಿಸೂಚನೆಗಳು",
      show_activity_classmates:
        "ನನ್ನ ಚಟುವಟಿಕೆಯನ್ನು ಸಹಪಾಠಿಗಳಿಗೆ ತೋರಿಸಿ",
      recent_submissions_comments:
        "ಇತ್ತೀಚಿನ ಸಲ್ಲಿಕೆಗಳು ಮತ್ತು ಕಾಮೆಂಟ್‌ಗಳನ್ನು ತೋರಿಸಿ",
      show_progress_leaderboards:
        "ಪ್ರಗತಿ ಲೀಡರ್‌ಬೋರ್ಡ್‌ಗಳನ್ನು ತೋರಿಸಿ",

      theme: "ಥೀಮ್",
      choose_application_appearance:
        "ನಿಮ್ಮ ಅಪ್ಲಿಕೇಶನ್‌ನ ನೋಟವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
      light: "ಲೈಟ್",
      dark: "ಡಾರ್ಕ್",

      changes_saved_successfully:
        "ಬದಲಾವಣೆಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ.",
      failed_to_save_changes:
        "ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಲು ವಿಫಲವಾಗಿದೆ.",
      save_changes: "ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ"
    }
  },

  "ml-IN": {
    translation: {
      dashboard: "ഡാഷ്ബോർഡ്",
      settings: "ക്രമീകരണങ്ങൾ",
      account: "അക്കൗണ്ട്",
      notifications: "അറിയിപ്പുകൾ",
      privacy: "സ്വകാര്യത",
      preferences: "മുൻഗണനകൾ",
      save: "സേവ് ചെയ്യുക",
      cancel: "റദ്ദാക്കുക",
      logout: "ലോഗ് ഔട്ട്",
      profile: "പ്രൊഫൈൽ",
      my_profile: "എന്റെ പ്രൊഫൈൽ",
      home: "ഹോം",
      courses: "കോഴ്സുകൾ",
      assessments: "വിലയിരുത്തലുകൾ",
      jobs: "ജോലികൾ",
      applications: "അപേക്ഷകൾ",
      interviews: "അഭിമുഖങ്ങൾ",
      reports: "റിപ്പോർട്ടുകൾ",
      messages: "സന്ദേശങ്ങൾ",
      help: "സഹായം",
      search: "തിരയുക",
      submit: "സമർപ്പിക്കുക",
      edit: "തിരുത്തുക",
      delete: "ഇല്ലാതാക്കുക",
      close: "അടയ്ക്കുക",
      back: "പിന്നിലേക്ക്",
      next: "അടുത്തത്",
      previous: "മുമ്പത്തെ",
      loading: "ലോഡ് ചെയ്യുന്നു...",
      welcome: "സ്വാഗതം",

      achievements: "നേട്ടങ്ങൾ",
      tasks_deadlines: "ടാസ്കുകളും സമയപരിധികളും",
      recommendations: "ശുപാർശകൾ",
      community: "കമ്മ്യൂണിറ്റി",
      insights: "അവബോധങ്ങൾ",
      engagement_trends: "പങ്കാളിത്ത പ്രവണതകൾ",
      gap_report: "സ്കിൽ ഗ്യാപ് റിപ്പോർട്ട്",
      job_applications: "ജോലി അപേക്ഷകൾ",
      learners: "പഠിതാക്കൾ",
      announcements: "അറിയിപ്പുകൾ",
      job_listings: "ജോലി ലിസ്റ്റിംഗുകൾ",
      certificate_validation: "സർട്ടിഫിക്കറ്റ് പരിശോധന",
      candidates: "സ്ഥാനാർത്ഥികൾ",
      analytics: "വിശകലനം",
      user_management: "ഉപയോക്തൃ മാനേജ്മെന്റ്",
      user_details: "ഉപയോക്തൃ വിവരങ്ങൾ",
      subscriptions: "സബ്‌സ്‌ക്രിപ്ഷനുകൾ",

      skill_platform: "സ്കിൽ പ്ലാറ്റ്ഫോം",
      close_menu: "മെനു അടയ്ക്കുക",
      open_menu: "മെനു തുറക്കുക",
      signed_in_as: "ഇങ്ങനെ സൈൻ ഇൻ ചെയ്തിരിക്കുന്നു",
      guest: "അതിഥി",

      education_saas_dashboard:
        "എഡ്യൂക്കേഷൻ SaaS ഡാഷ്ബോർഡ്",
      search_courses_skills_candidates:
        "കോഴ്സുകൾ, കഴിവുകൾ, സ്ഥാനാർത്ഥികളെ തിരയുക…",
      searching: "തിരയുന്നു...",
      no_results_for: "ഫലങ്ങളൊന്നും കണ്ടെത്തിയില്ല",
      members: "അംഗങ്ങൾ",
      student: "വിദ്യാർത്ഥി",
      remove_request: "അഭ്യർത്ഥന നീക്കം ചെയ്യുക",
      connect: "ബന്ധപ്പെടുക",
      latest_5: "ഏറ്റവും പുതിയ 5",
      loading_notifications:
        "അറിയിപ്പുകൾ ലോഡ് ചെയ്യുന്നു...",
      unable_to_load_notifications:
        "അറിയിപ്പുകൾ ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല.",
      no_notifications:
        "അറിയിപ്പുകളൊന്നുമില്ല",

      connection_request_sent:
        "കണക്ഷൻ അഭ്യർത്ഥന അയച്ചു!",
      failed_to_send_request:
        "അഭ്യർത്ഥന അയയ്ക്കുന്നതിൽ പരാജയപ്പെട്ടു",
      request_cancelled:
        "അഭ്യർത്ഥന റദ്ദാക്കി",
      failed_to_cancel_request:
        "അഭ്യർത്ഥന റദ്ദാക്കുന്നതിൽ പരാജയപ്പെട്ടു",

      welcome_employer:
        "വീണ്ടും സ്വാഗതം, {{name}} — മികച്ച സ്ഥാനാർത്ഥികളെ കണ്ടെത്തി ബന്ധപ്പെടുക.",
      welcome_educator:
        "വീണ്ടും സ്വാഗതം, {{name}} — കോഴ്സുകൾ നിയന്ത്രിക്കുകയും പഠിതാക്കളെ പ്രചോദിപ്പിക്കുകയും ചെയ്യുക.",
      welcome_student:
        "വീണ്ടും സ്വാഗതം, {{name}} — നിങ്ങളുടെ സ്കിൽ ഗ്യാപ്പുകൾ കുറയ്ക്കാം.",

      manage_account_description:
        "നിങ്ങളുടെ അക്കൗണ്ട് വിവരങ്ങളും മുൻഗണനകളും നിയന്ത്രിക്കുക.",
      profile_visibility: "പ്രൊഫൈൽ ദൃശ്യപരത",
      visible_to_all_classmates:
        "എല്ലാ സഹപാഠികൾക്കും കാണാം",
      private: "സ്വകാര്യം",
      public: "പൊതു",
      email_address: "ഇമെയിൽ വിലാസം",
      email_read_only:
        "ഇമെയിൽ വിലാസം ഇവിടെ മാറ്റാൻ കഴിയില്ല.",
      change_password: "പാസ്‌വേഡ് മാറ്റുക",
      password_reset_coming_soon:
        "പാസ്‌വേഡ് റീസെറ്റ് ഉടൻ ലഭ്യമാകും.",
      change: "മാറ്റുക",

      enable_dark_mode: "ഡാർക്ക് മോഡ് പ്രവർത്തനക്ഷമമാക്കുക",
      dark_mode_description:
        "മുഴുവൻ ആപ്ലിക്കേഷനിലും ഡാർക്ക് മോഡ് ഉപയോഗിക്കുക.",
      learning_reminders: "പഠന ഓർമ്മപ്പെടുത്തലുകൾ",
      receive_task_reminders:
        "നിങ്ങളുടെ ടാസ്കുകളെയും സമയപരിധികളെയും കുറിച്ചുള്ള ഓർമ്മപ്പെടുത്തലുകൾ ലഭിക്കുക.",

      language: "ഭാഷ",
      choose_preferred_language:
        "നിങ്ങളുടെ ഇഷ്ടപ്പെട്ട ഭാഷ തിരഞ്ഞെടുക്കുക.",
      selected_language: "തിരഞ്ഞെടുത്ത ഭാഷ",
      time_zone: "സമയ മേഖല",

      weekly_digest_email:
        "പ്രതിവാര സംഗ്രഹ ഇമെയിൽ",
      progress_recommendations:
        "പുരോഗതി ശുപാർശകൾ",
      upcoming_task_notifications:
        "വരാനിരിക്കുന്ന ടാസ്ക് അറിയിപ്പുകൾ",
      show_activity_classmates:
        "എന്റെ പ്രവർത്തനം സഹപാഠികൾക്ക് കാണിക്കുക",
      recent_submissions_comments:
        "സമീപകാല സമർപ്പണങ്ങളും അഭിപ്രായങ്ങളും കാണിക്കുക",
      show_progress_leaderboards:
        "പുരോഗതി ലീഡർബോർഡുകൾ കാണിക്കുക",

      theme: "തീം",
      choose_application_appearance:
        "ആപ്ലിക്കേഷന്റെ രൂപം തിരഞ്ഞെടുക്കുക.",
      light: "ലൈറ്റ്",
      dark: "ഡാർക്ക്",

      changes_saved_successfully:
        "മാറ്റങ്ങൾ വിജയകരമായി സംരക്ഷിച്ചു.",
      failed_to_save_changes:
        "മാറ്റങ്ങൾ സംരക്ഷിക്കുന്നതിൽ പരാജയപ്പെട്ടു.",
      save_changes: "മാറ്റങ്ങൾ സംരക്ഷിക്കുക"
    }
  },

  "bn-IN": {
    translation: {
      dashboard: "ড্যাশবোর্ড",
      settings: "সেটিংস",
      account: "অ্যাকাউন্ট",
      notifications: "বিজ্ঞপ্তি",
      privacy: "গোপনীয়তা",
      preferences: "পছন্দসমূহ",
      save: "সংরক্ষণ করুন",
      cancel: "বাতিল করুন",
      logout: "লগ আউট",
      profile: "প্রোফাইল",
      my_profile: "আমার প্রোফাইল",
      home: "হোম",
      courses: "কোর্স",
      assessments: "মূল্যায়ন",
      jobs: "চাকরি",
      applications: "আবেদন",
      interviews: "সাক্ষাৎকার",
      reports: "রিপোর্ট",
      messages: "বার্তা",
      help: "সহায়তা",
      search: "অনুসন্ধান",
      submit: "জমা দিন",
      edit: "সম্পাদনা",
      delete: "মুছুন",
      close: "বন্ধ করুন",
      back: "পিছনে",
      next: "পরবর্তী",
      previous: "পূর্ববর্তী",
      loading: "লোড হচ্ছে...",
      welcome: "স্বাগতম",

      achievements: "অর্জন",
      tasks_deadlines: "কাজ ও সময়সীমা",
      recommendations: "সুপারিশ",
      community: "কমিউনিটি",
      insights: "অন্তর্দৃষ্টি",
      engagement_trends: "সম্পৃক্ততার প্রবণতা",
      gap_report: "দক্ষতার ঘাটতি রিপোর্ট",
      job_applications: "চাকরির আবেদন",
      learners: "শিক্ষার্থী",
      announcements: "ঘোষণা",
      job_listings: "চাকরির তালিকা",
      certificate_validation: "সার্টিফিকেট যাচাই",
      candidates: "প্রার্থী",
      analytics: "বিশ্লেষণ",
      user_management: "ব্যবহারকারী ব্যবস্থাপনা",
      user_details: "ব্যবহারকারীর বিবরণ",
      subscriptions: "সাবস্ক্রিপশন",

      skill_platform: "স্কিল প্ল্যাটফর্ম",
      close_menu: "মেনু বন্ধ করুন",
      open_menu: "মেনু খুলুন",
      signed_in_as: "এই নামে সাইন ইন করা হয়েছে",
      guest: "অতিথি",

      education_saas_dashboard:
        "এডুকেশন SaaS ড্যাশবোর্ড",
      search_courses_skills_candidates:
        "কোর্স, দক্ষতা, প্রার্থী অনুসন্ধান করুন…",
      searching: "অনুসন্ধান করা হচ্ছে...",
      no_results_for: "কোনো ফলাফল পাওয়া যায়নি",
      members: "সদস্য",
      student: "শিক্ষার্থী",
      remove_request: "অনুরোধ সরান",
      connect: "সংযুক্ত করুন",
      latest_5: "সর্বশেষ ৫",
      loading_notifications:
        "বিজ্ঞপ্তি লোড হচ্ছে...",
      unable_to_load_notifications:
        "বিজ্ঞপ্তি লোড করা যায়নি।",
      no_notifications:
        "কোনো বিজ্ঞপ্তি নেই",

      connection_request_sent:
        "কানেকশন অনুরোধ পাঠানো হয়েছে!",
      failed_to_send_request:
        "অনুরোধ পাঠানো যায়নি",
      request_cancelled:
        "অনুরোধ বাতিল করা হয়েছে",
      failed_to_cancel_request:
        "অনুরোধ বাতিল করা যায়নি",

      welcome_employer:
        "আবার স্বাগতম, {{name}} — সেরা প্রার্থীদের খুঁজে সংযুক্ত হন।",
      welcome_educator:
        "আবার স্বাগতম, {{name}} — কোর্স পরিচালনা করুন এবং শিক্ষার্থীদের অনুপ্রাণিত করুন।",
      welcome_student:
        "আবার স্বাগতম, {{name}} — আপনার দক্ষতার ঘাটতি কমিয়ে আনি।",

      manage_account_description:
        "আপনার অ্যাকাউন্টের তথ্য ও পছন্দ পরিচালনা করুন।",
      profile_visibility: "প্রোফাইল দৃশ্যমানতা",
      visible_to_all_classmates:
        "সব সহপাঠীর কাছে দৃশ্যমান",
      private: "ব্যক্তিগত",
      public: "সর্বজনীন",
      email_address: "ইমেল ঠিকানা",
      email_read_only:
        "ইমেল ঠিকানা এখানে পরিবর্তন করা যাবে না।",
      change_password: "পাসওয়ার্ড পরিবর্তন করুন",
      password_reset_coming_soon:
        "পাসওয়ার্ড রিসেট শীঘ্রই পাওয়া যাবে।",
      change: "পরিবর্তন করুন",

      enable_dark_mode: "ডার্ক মোড চালু করুন",
      dark_mode_description:
        "পুরো অ্যাপ্লিকেশনে ডার্ক মোড ব্যবহার করুন।",
      learning_reminders: "শেখার রিমাইন্ডার",
      receive_task_reminders:
        "আপনার কাজ ও সময়সীমার জন্য রিমাইন্ডার পান।",

      language: "ভাষা",
      choose_preferred_language:
        "আপনার পছন্দের ভাষা নির্বাচন করুন।",
      selected_language: "নির্বাচিত ভাষা",
      time_zone: "সময় অঞ্চল",

      weekly_digest_email:
        "সাপ্তাহিক সারাংশ ইমেল",
      progress_recommendations:
        "অগ্রগতির সুপারিশ",
      upcoming_task_notifications:
        "আসন্ন কাজের বিজ্ঞপ্তি",
      show_activity_classmates:
        "আমার কার্যকলাপ সহপাঠীদের দেখান",
      recent_submissions_comments:
        "সাম্প্রতিক জমা ও মন্তব্য দেখান",
      show_progress_leaderboards:
        "অগ্রগতি লিডারবোর্ড দেখান",

      theme: "থিম",
      choose_application_appearance:
        "অ্যাপ্লিকেশনের চেহারা নির্বাচন করুন।",
      light: "লাইট",
      dark: "ডার্ক",

      changes_saved_successfully:
        "পরিবর্তন সফলভাবে সংরক্ষণ করা হয়েছে।",
      failed_to_save_changes:
        "পরিবর্তন সংরক্ষণ করা যায়নি।",
      save_changes: "পরিবর্তন সংরক্ষণ করুন"
    }
  },

  "mr-IN": {
    translation: {
      dashboard: "डॅशबोर्ड",
      settings: "सेटिंग्ज",
      account: "खाते",
      notifications: "सूचना",
      privacy: "गोपनीयता",
      preferences: "प्राधान्ये",
      save: "जतन करा",
      cancel: "रद्द करा",
      logout: "लॉग आउट",
      profile: "प्रोफाइल",
      my_profile: "माझे प्रोफाइल",
      home: "मुख्यपृष्ठ",
      courses: "अभ्यासक्रम",
      assessments: "मूल्यांकन",
      jobs: "नोकऱ्या",
      applications: "अर्ज",
      interviews: "मुलाखती",
      reports: "अहवाल",
      messages: "संदेश",
      help: "मदत",
      search: "शोधा",
      submit: "सबमिट करा",
      edit: "संपादित करा",
      delete: "हटवा",
      close: "बंद करा",
      back: "मागे",
      next: "पुढे",
      previous: "मागील",
      loading: "लोड होत आहे...",
      welcome: "स्वागत आहे",

      achievements: "यश",
      tasks_deadlines: "कामे आणि अंतिम मुदती",
      recommendations: "शिफारसी",
      community: "समुदाय",
      insights: "अंतर्दृष्टी",
      engagement_trends: "सहभागाचे ट्रेंड",
      gap_report: "कौशल्य अंतर अहवाल",
      job_applications: "नोकरीचे अर्ज",
      learners: "शिकणारे",
      announcements: "घोषणा",
      job_listings: "नोकरीच्या सूची",
      certificate_validation: "प्रमाणपत्र पडताळणी",
      candidates: "उमेदवार",
      analytics: "विश्लेषण",
      user_management: "वापरकर्ता व्यवस्थापन",
      user_details: "वापरकर्ता तपशील",
      subscriptions: "सदस्यता",

      skill_platform: "स्किल प्लॅटफॉर्म",
      close_menu: "मेनू बंद करा",
      open_menu: "मेनू उघडा",
      signed_in_as: "या नावाने साइन इन केले आहे",
      guest: "अतिथी",

      education_saas_dashboard:
        "एज्युकेशन SaaS डॅशबोर्ड",
      search_courses_skills_candidates:
        "अभ्यासक्रम, कौशल्ये, उमेदवार शोधा…",
      searching: "शोधत आहे...",
      no_results_for: "कोणतेही परिणाम सापडले नाहीत",
      members: "सदस्य",
      student: "विद्यार्थी",
      remove_request: "विनंती काढा",
      connect: "कनेक्ट करा",
      latest_5: "नवीनतम 5",
      loading_notifications:
        "सूचना लोड होत आहेत...",
      unable_to_load_notifications:
        "सूचना लोड करता आल्या नाहीत.",
      no_notifications:
        "कोणत्याही सूचना नाहीत",

      connection_request_sent:
        "कनेक्शन विनंती पाठवली!",
      failed_to_send_request:
        "विनंती पाठवता आली नाही",
      request_cancelled:
        "विनंती रद्द केली",
      failed_to_cancel_request:
        "विनंती रद्द करता आली नाही",

      welcome_employer:
        "पुन्हा स्वागत आहे, {{name}} — सर्वोत्तम उमेदवार शोधा आणि त्यांच्याशी कनेक्ट व्हा.",
      welcome_educator:
        "पुन्हा स्वागत आहे, {{name}} — अभ्यासक्रम व्यवस्थापित करा आणि शिकणाऱ्यांना प्रेरित करा.",
      welcome_student:
        "पुन्हा स्वागत आहे, {{name}} — तुमचे कौशल्य अंतर कमी करूया.",

      manage_account_description:
        "तुमची खाते माहिती आणि प्राधान्ये व्यवस्थापित करा.",
      profile_visibility: "प्रोफाइल दृश्यमानता",
      visible_to_all_classmates:
        "सर्व वर्गमित्रांना दिसेल",
      private: "खाजगी",
      public: "सार्वजनिक",
      email_address: "ईमेल पत्ता",
      email_read_only:
        "ईमेल पत्ता येथे बदलता येणार नाही.",
      change_password: "पासवर्ड बदला",
      password_reset_coming_soon:
        "पासवर्ड रीसेट लवकरच उपलब्ध होईल.",
      change: "बदला",

      enable_dark_mode: "डार्क मोड सक्षम करा",
      dark_mode_description:
        "संपूर्ण अनुप्रयोगात डार्क मोड वापरा.",
      learning_reminders: "शिकण्याचे स्मरणपत्र",
      receive_task_reminders:
        "तुमच्या कामे आणि अंतिम मुदतींबद्दल स्मरणपत्रे मिळवा.",

      language: "भाषा",
      choose_preferred_language:
        "तुमची पसंतीची भाषा निवडा.",
      selected_language: "निवडलेली भाषा",
      time_zone: "वेळ क्षेत्र",

      weekly_digest_email:
        "साप्ताहिक सारांश ईमेल",
      progress_recommendations:
        "प्रगती शिफारसी",
      upcoming_task_notifications:
        "आगामी कामांच्या सूचना",
      show_activity_classmates:
        "माझी क्रियाकलाप वर्गमित्रांना दाखवा",
      recent_submissions_comments:
        "अलीकडील सबमिशन आणि टिप्पण्या दाखवा",
      show_progress_leaderboards:
        "प्रगती लीडरबोर्ड दाखवा",

      theme: "थीम",
      choose_application_appearance:
        "अनुप्रयोगाचा देखावा निवडा.",
      light: "लाइट",
      dark: "डार्क",

      changes_saved_successfully:
        "बदल यशस्वीरित्या जतन केले.",
      failed_to_save_changes:
        "बदल जतन करता आले नाहीत.",
      save_changes: "बदल जतन करा"
    }
  },

  "gu-IN": {
    translation: {
      dashboard: "ડેશબોર્ડ",
      settings: "સેટિંગ્સ",
      account: "એકાઉન્ટ",
      notifications: "સૂચનાઓ",
      privacy: "ગોપનીયતા",
      preferences: "પસંદગીઓ",
      save: "સાચવો",
      cancel: "રદ કરો",
      logout: "લૉગ આઉટ",
      profile: "પ્રોફાઇલ",
      my_profile: "મારું પ્રોફાઇલ",
      home: "હોમ",
      courses: "અભ્યાસક્રમો",
      assessments: "મૂલ્યાંકન",
      jobs: "નોકરીઓ",
      applications: "અરજીઓ",
      interviews: "ઇન્ટરવ્યૂ",
      reports: "અહેવાલો",
      messages: "સંદેશાઓ",
      help: "મદદ",
      search: "શોધો",
      submit: "સબમિટ કરો",
      edit: "ફેરફાર કરો",
      delete: "કાઢી નાખો",
      close: "બંધ કરો",
      back: "પાછા",
      next: "આગળ",
      previous: "પહેલાનું",
      loading: "લોડ થઈ રહ્યું છે...",
      welcome: "સ્વાગત છે",

      achievements: "સિદ્ધિઓ",
      tasks_deadlines: "કાર્યો અને સમયમર્યાદા",
      recommendations: "ભલામણો",
      community: "સમુદાય",
      insights: "અંતર્દૃષ્ટિ",
      engagement_trends: "સહભાગિતાના ટ્રેન્ડ્સ",
      gap_report: "કૌશલ્ય ગેપ રિપોર્ટ",
      job_applications: "નોકરીની અરજીઓ",
      learners: "શીખનારાઓ",
      announcements: "જાહેરાતો",
      job_listings: "નોકરીની યાદી",
      certificate_validation: "પ્રમાણપત્ર ચકાસણી",
      candidates: "ઉમેદવારો",
      analytics: "વિશ્લેષણ",
      user_management: "વપરાશકર્તા વ્યવસ્થાપન",
      user_details: "વપરાશકર્તા વિગતો",
      subscriptions: "સબ્સ્ક્રિપ્શન",

      skill_platform: "સ્કિલ પ્લેટફોર્મ",
      close_menu: "મેનુ બંધ કરો",
      open_menu: "મેનુ ખોલો",
      signed_in_as: "આ રીતે સાઇન ઇન થયેલ છે",
      guest: "મહેમાન",

      education_saas_dashboard:
        "એજ્યુકેશન SaaS ડેશબોર્ડ",
      search_courses_skills_candidates:
        "અભ્યાસક્રમો, કૌશલ્યો, ઉમેદવારો શોધો…",
      searching: "શોધી રહ્યા છીએ...",
      no_results_for: "કોઈ પરિણામ મળ્યું નથી",
      members: "સભ્યો",
      student: "વિદ્યાર્થી",
      remove_request: "વિનંતી દૂર કરો",
      connect: "કનેક્ટ કરો",
      latest_5: "તાજેતરના 5",
      loading_notifications:
        "સૂચનાઓ લોડ થઈ રહી છે...",
      unable_to_load_notifications:
        "સૂચનાઓ લોડ કરી શકાઈ નથી.",
      no_notifications:
        "કોઈ સૂચનાઓ નથી",

      connection_request_sent:
        "કનેક્શન વિનંતી મોકલવામાં આવી!",
      failed_to_send_request:
        "વિનંતી મોકલી શકાઈ નથી",
      request_cancelled:
        "વિનંતી રદ કરવામાં આવી",
      failed_to_cancel_request:
        "વિનંતી રદ કરી શકાઈ નથી",

      welcome_employer:
        "ફરી સ્વાગત છે, {{name}} — શ્રેષ્ઠ ઉમેદવારો શોધો અને તેમની સાથે જોડાઓ.",
      welcome_educator:
        "ફરી સ્વાગત છે, {{name}} — અભ્યાસક્રમો સંચાલિત કરો અને શીખનારાઓને પ્રેરણા આપો.",
      welcome_student:
        "ફરી સ્વાગત છે, {{name}} — તમારા કૌશલ્ય ગેપને ઘટાડીએ.",

      manage_account_description:
        "તમારી એકાઉન્ટ માહિતી અને પસંદગીઓ મેનેજ કરો.",
      profile_visibility: "પ્રોફાઇલ દૃશ્યતા",
      visible_to_all_classmates:
        "બધા સહપાઠીઓને દેખાશે",
      private: "ખાનગી",
      public: "જાહેર",
      email_address: "ઇમેઇલ સરનામું",
      email_read_only:
        "ઇમેઇલ સરનામું અહીં બદલી શકાતું નથી.",
      change_password: "પાસવર્ડ બદલો",
      password_reset_coming_soon:
        "પાસવર્ડ રીસેટ ટૂંક સમયમાં ઉપલબ્ધ થશે.",
      change: "બદલો",

      enable_dark_mode: "ડાર્ક મોડ સક્ષમ કરો",
      dark_mode_description:
        "સમગ્ર એપ્લિકેશનમાં ડાર્ક મોડનો ઉપયોગ કરો.",
      learning_reminders: "લર્નિંગ રિમાઇન્ડર્સ",
      receive_task_reminders:
        "તમારા કાર્યો અને સમયમર્યાદા માટે રિમાઇન્ડર્સ મેળવો.",

      language: "ભાષા",
      choose_preferred_language:
        "તમારી પસંદગીની ભાષા પસંદ કરો.",
      selected_language: "પસંદ કરેલી ભાષા",
      time_zone: "સમય ઝોન",

      weekly_digest_email:
        "સાપ્તાહિક ડાઇજેસ્ટ ઇમેઇલ",
      progress_recommendations:
        "પ્રગતિ ભલામણો",
      upcoming_task_notifications:
        "આગામી કાર્ય સૂચનાઓ",
      show_activity_classmates:
        "મારી પ્રવૃત્તિ સહપાઠીઓને બતાવો",
      recent_submissions_comments:
        "તાજેતરના સબમિશન અને ટિપ્પણીઓ બતાવો",
      show_progress_leaderboards:
        "પ્રગતિ લીડરબોર્ડ બતાવો",

      theme: "થીમ",
      choose_application_appearance:
        "તમારી એપ્લિકેશનનો દેખાવ પસંદ કરો.",
      light: "લાઇટ",
      dark: "ડાર્ક",

      changes_saved_successfully:
        "ફેરફારો સફળતાપૂર્વક સાચવવામાં આવ્યા.",
      failed_to_save_changes:
        "ફેરફારો સાચવી શકાયા નથી.",
      save_changes: "ફેરફારો સાચવો"
    }
  },

  "pa-IN": {
    translation: {
      dashboard: "ਡੈਸ਼ਬੋਰਡ",
      settings: "ਸੈਟਿੰਗਾਂ",
      account: "ਖਾਤਾ",
      notifications: "ਸੂਚਨਾਵਾਂ",
      privacy: "ਪਰਦੇਦਾਰੀ",
      preferences: "ਤਰਜੀਹਾਂ",
      save: "ਸੇਵ ਕਰੋ",
      cancel: "ਰੱਦ ਕਰੋ",
      logout: "ਲੌਗ ਆਊਟ",
      profile: "ਪ੍ਰੋਫਾਈਲ",
      my_profile: "ਮੇਰੀ ਪ੍ਰੋਫਾਈਲ",
      home: "ਹੋਮ",
      courses: "ਕੋਰਸ",
      assessments: "ਮੁਲਾਂਕਣ",
      jobs: "ਨੌਕਰੀਆਂ",
      applications: "ਅਰਜ਼ੀਆਂ",
      interviews: "ਇੰਟਰਵਿਊ",
      reports: "ਰਿਪੋਰਟਾਂ",
      messages: "ਸੁਨੇਹੇ",
      help: "ਮਦਦ",
      search: "ਖੋਜੋ",
      submit: "ਜਮ੍ਹਾਂ ਕਰੋ",
      edit: "ਸੋਧੋ",
      delete: "ਮਿਟਾਓ",
      close: "ਬੰਦ ਕਰੋ",
      back: "ਪਿੱਛੇ",
      next: "ਅੱਗੇ",
      previous: "ਪਿਛਲਾ",
      loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
      welcome: "ਜੀ ਆਇਆਂ ਨੂੰ",

      achievements: "ਪ੍ਰਾਪਤੀਆਂ",
      tasks_deadlines: "ਕੰਮ ਅਤੇ ਸਮਾਂ ਸੀਮਾਵਾਂ",
      recommendations: "ਸਿਫ਼ਾਰਸ਼ਾਂ",
      community: "ਭਾਈਚਾਰਾ",
      insights: "ਅੰਦਰੂਨੀ ਜਾਣਕਾਰੀ",
      engagement_trends: "ਸ਼ਮੂਲੀਅਤ ਰੁਝਾਨ",
      gap_report: "ਹੁਨਰ ਅੰਤਰ ਰਿਪੋਰਟ",
      job_applications: "ਨੌਕਰੀ ਅਰਜ਼ੀਆਂ",
      learners: "ਸਿਖਿਆਰਥੀ",
      announcements: "ਘੋਸ਼ਣਾਵਾਂ",
      job_listings: "ਨੌਕਰੀ ਸੂਚੀਆਂ",
      certificate_validation: "ਸਰਟੀਫਿਕੇਟ ਪੁਸ਼ਟੀਕਰਨ",
      candidates: "ਉਮੀਦਵਾਰ",
      analytics: "ਵਿਸ਼ਲੇਸ਼ਣ",
      user_management: "ਯੂਜ਼ਰ ਪ੍ਰਬੰਧਨ",
      user_details: "ਯੂਜ਼ਰ ਵੇਰਵੇ",
      subscriptions: "ਸਬਸਕ੍ਰਿਪਸ਼ਨ",

      skill_platform: "ਸਕਿਲ ਪਲੇਟਫਾਰਮ",
      close_menu: "ਮੈਨੂ ਬੰਦ ਕਰੋ",
      open_menu: "ਮੈਨੂ ਖੋਲ੍ਹੋ",
      signed_in_as: "ਇਸ ਨਾਮ ਨਾਲ ਸਾਈਨ ਇਨ",
      guest: "ਮਹਿਮਾਨ",

      education_saas_dashboard:
        "ਐਜੂਕੇਸ਼ਨ SaaS ਡੈਸ਼ਬੋਰਡ",
      search_courses_skills_candidates:
        "ਕੋਰਸ, ਹੁਨਰ, ਉਮੀਦਵਾਰ ਖੋਜੋ…",
      searching: "ਖੋਜਿਆ ਜਾ ਰਿਹਾ ਹੈ...",
      no_results_for: "ਕੋਈ ਨਤੀਜਾ ਨਹੀਂ ਮਿਲਿਆ",
      members: "ਮੈਂਬਰ",
      student: "ਵਿਦਿਆਰਥੀ",
      remove_request: "ਬੇਨਤੀ ਹਟਾਓ",
      connect: "ਕਨੈਕਟ ਕਰੋ",
      latest_5: "ਨਵੀਨਤਮ 5",
      loading_notifications:
        "ਸੂਚਨਾਵਾਂ ਲੋਡ ਹੋ ਰਹੀਆਂ ਹਨ...",
      unable_to_load_notifications:
        "ਸੂਚਨਾਵਾਂ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੀਆਂ।",
      no_notifications:
        "ਕੋਈ ਸੂਚਨਾਵਾਂ ਨਹੀਂ",

      connection_request_sent:
        "ਕਨੈਕਸ਼ਨ ਬੇਨਤੀ ਭੇਜੀ ਗਈ!",
      failed_to_send_request:
        "ਬੇਨਤੀ ਭੇਜਣ ਵਿੱਚ ਅਸਫਲ",
      request_cancelled:
        "ਬੇਨਤੀ ਰੱਦ ਕੀਤੀ ਗਈ",
      failed_to_cancel_request:
        "ਬੇਨਤੀ ਰੱਦ ਕਰਨ ਵਿੱਚ ਅਸਫਲ",

      welcome_employer:
        "ਵਾਪਸੀ ਤੇ ਜੀ ਆਇਆਂ ਨੂੰ, {{name}} — ਵਧੀਆ ਉਮੀਦਵਾਰ ਲੱਭੋ ਅਤੇ ਉਨ੍ਹਾਂ ਨਾਲ ਜੁੜੋ।",
      welcome_educator:
        "ਵਾਪਸੀ ਤੇ ਜੀ ਆਇਆਂ ਨੂੰ, {{name}} — ਕੋਰਸਾਂ ਦਾ ਪ੍ਰਬੰਧ ਕਰੋ ਅਤੇ ਸਿਖਿਆਰਥੀਆਂ ਨੂੰ ਪ੍ਰੇਰਿਤ ਕਰੋ।",
      welcome_student:
        "ਵਾਪਸੀ ਤੇ ਜੀ ਆਇਆਂ ਨੂੰ, {{name}} — ਆਪਣੇ ਹੁਨਰ ਅੰਤਰ ਨੂੰ ਘਟਾਈਏ।",

      manage_account_description:
        "ਆਪਣੇ ਖਾਤੇ ਦੀ ਜਾਣਕਾਰੀ ਅਤੇ ਤਰਜੀਹਾਂ ਦਾ ਪ੍ਰਬੰਧ ਕਰੋ।",
      profile_visibility: "ਪ੍ਰੋਫਾਈਲ ਦਿੱਖ",
      visible_to_all_classmates:
        "ਸਾਰੇ ਸਹਿਪਾਠੀਆਂ ਨੂੰ ਦਿਖਾਈ ਦੇਵੇਗਾ",
      private: "ਨਿੱਜੀ",
      public: "ਜਨਤਕ",
      email_address: "ਈਮੇਲ ਪਤਾ",
      email_read_only:
        "ਈਮੇਲ ਪਤਾ ਇੱਥੇ ਬਦਲਿਆ ਨਹੀਂ ਜਾ ਸਕਦਾ।",
      change_password: "ਪਾਸਵਰਡ ਬਦਲੋ",
      password_reset_coming_soon:
        "ਪਾਸਵਰਡ ਰੀਸੈੱਟ ਜਲਦੀ ਉਪਲਬਧ ਹੋਵੇਗਾ।",
      change: "ਬਦਲੋ",

      enable_dark_mode: "ਡਾਰਕ ਮੋਡ ਚਾਲੂ ਕਰੋ",
      dark_mode_description:
        "ਪੂਰੀ ਐਪਲੀਕੇਸ਼ਨ ਵਿੱਚ ਡਾਰਕ ਮੋਡ ਵਰਤੋ।",
      learning_reminders: "ਸਿੱਖਣ ਦੇ ਰਿਮਾਈਂਡਰ",
      receive_task_reminders:
        "ਆਪਣੇ ਕੰਮਾਂ ਅਤੇ ਸਮਾਂ ਸੀਮਾਵਾਂ ਬਾਰੇ ਰਿਮਾਈਂਡਰ ਪ੍ਰਾਪਤ ਕਰੋ।",

      language: "ਭਾਸ਼ਾ",
      choose_preferred_language:
        "ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਚੁਣੋ।",
      selected_language: "ਚੁਣੀ ਗਈ ਭਾਸ਼ਾ",
      time_zone: "ਸਮਾਂ ਖੇਤਰ",

      weekly_digest_email:
        "ਹਫ਼ਤਾਵਾਰੀ ਸੰਖੇਪ ਈਮੇਲ",
      progress_recommendations:
        "ਤਰੱਕੀ ਦੀਆਂ ਸਿਫ਼ਾਰਸ਼ਾਂ",
      upcoming_task_notifications:
        "ਆਉਣ ਵਾਲੇ ਕੰਮਾਂ ਦੀਆਂ ਸੂਚਨਾਵਾਂ",
      show_activity_classmates:
        "ਮੇਰੀ ਗਤੀਵਿਧੀ ਸਹਿਪਾਠੀਆਂ ਨੂੰ ਦਿਖਾਓ",
      recent_submissions_comments:
        "ਹਾਲੀਆ ਜਮ੍ਹਾਂ ਅਤੇ ਟਿੱਪਣੀਆਂ ਦਿਖਾਓ",
      show_progress_leaderboards:
        "ਤਰੱਕੀ ਲੀਡਰਬੋਰਡ ਦਿਖਾਓ",

      theme: "ਥੀਮ",
      choose_application_appearance:
        "ਐਪਲੀਕੇਸ਼ਨ ਦੀ ਦਿੱਖ ਚੁਣੋ।",
      light: "ਲਾਈਟ",
      dark: "ਡਾਰਕ",

      changes_saved_successfully:
        "ਤਬਦੀਲੀਆਂ ਸਫਲਤਾਪੂਰਵਕ ਸੇਵ ਹੋ ਗਈਆਂ।",
      failed_to_save_changes:
        "ਤਬਦੀਲੀਆਂ ਸੇਵ ਕਰਨ ਵਿੱਚ ਅਸਫਲ।",
      save_changes: "ਤਬਦੀਲੀਆਂ ਸੇਵ ਕਰੋ"
    }
  },

  "or-IN": {
    translation: {
      dashboard: "ଡ୍ୟାସବୋର୍ଡ",
      settings: "ସେଟିଂସ୍",
      account: "ଖାତା",
      notifications: "ବିଜ୍ଞପ୍ତି",
      privacy: "ଗୋପନୀୟତା",
      preferences: "ପସନ୍ଦଗୁଡ଼ିକ",
      save: "ସଂରକ୍ଷଣ କରନ୍ତୁ",
      cancel: "ବାତିଲ କରନ୍ତୁ",
      logout: "ଲଗ୍ ଆଉଟ୍",
      profile: "ପ୍ରୋଫାଇଲ୍",
      my_profile: "ମୋ ପ୍ରୋଫାଇଲ୍",
      home: "ହୋମ୍",
      courses: "ପାଠ୍ୟକ୍ରମ",
      assessments: "ମୂଲ୍ୟାୟନ",
      jobs: "ଚାକିରି",
      applications: "ଆବେଦନ",
      interviews: "ସାକ୍ଷାତକାର",
      reports: "ରିପୋର୍ଟ",
      messages: "ବାର୍ତ୍ତା",
      help: "ସହାୟତା",
      search: "ସନ୍ଧାନ",
      submit: "ଦାଖଲ କରନ୍ତୁ",
      edit: "ସମ୍ପାଦନା କରନ୍ତୁ",
      delete: "ଡିଲିଟ୍ କରନ୍ତୁ",
      close: "ବନ୍ଦ କରନ୍ତୁ",
      back: "ପଛକୁ",
      next: "ପରବର୍ତ୍ତୀ",
      previous: "ପୂର୍ବବର୍ତ୍ତୀ",
      loading: "ଲୋଡ୍ ହେଉଛି...",
      welcome: "ସ୍ୱାଗତ",

      achievements: "ସଫଳତା",
      tasks_deadlines: "କାର୍ଯ୍ୟ ଏବଂ ସମୟସୀମା",
      recommendations: "ସୁପାରିଶ",
      community: "ସମୁଦାୟ",
      insights: "ଅନ୍ତର୍ଦୃଷ୍ଟି",
      engagement_trends: "ଯୋଗଦାନ ପ୍ରବଣତା",
      gap_report: "ଦକ୍ଷତା ଅନ୍ତର ରିପୋର୍ଟ",
      job_applications: "ଚାକିରି ଆବେଦନ",
      learners: "ଶିକ୍ଷାର୍ଥୀ",
      announcements: "ଘୋଷଣା",
      job_listings: "ଚାକିରି ତାଲିକା",
      certificate_validation: "ସାର୍ଟିଫିକେଟ୍ ଯାଞ୍ଚ",
      candidates: "ପ୍ରାର୍ଥୀ",
      analytics: "ବିଶ୍ଳେଷଣ",
      user_management: "ବ୍ୟବହାରକାରୀ ପରିଚାଳନା",
      user_details: "ବ୍ୟବହାରକାରୀ ବିବରଣୀ",
      subscriptions: "ସବସ୍କ୍ରିପସନ୍",

      skill_platform: "ସ୍କିଲ୍ ପ୍ଲାଟଫର୍ମ",
      close_menu: "ମେନୁ ବନ୍ଦ କରନ୍ତୁ",
      open_menu: "ମେନୁ ଖୋଲନ୍ତୁ",
      signed_in_as: "ଏହି ନାମରେ ସାଇନ୍ ଇନ୍",
      guest: "ଅତିଥି",

      education_saas_dashboard:
        "ଏଡୁକେସନ୍ SaaS ଡ୍ୟାସବୋର୍ଡ",
      search_courses_skills_candidates:
        "ପାଠ୍ୟକ୍ରମ, ଦକ୍ଷତା, ପ୍ରାର୍ଥୀ ଖୋଜନ୍ତୁ…",
      searching: "ସନ୍ଧାନ କରାଯାଉଛି...",
      no_results_for:
        "କୌଣସି ଫଳାଫଳ ମିଳିଲା ନାହିଁ",
      members: "ସଦସ୍ୟ",
      student: "ଛାତ୍ର",
      remove_request: "ଅନୁରୋଧ ହଟାନ୍ତୁ",
      connect: "ସଂଯୋଗ କରନ୍ତୁ",
      latest_5: "ସର୍ବଶେଷ ୫",
      loading_notifications:
        "ବିଜ୍ଞପ୍ତି ଲୋଡ୍ ହେଉଛି...",
      unable_to_load_notifications:
        "ବିଜ୍ଞପ୍ତି ଲୋଡ୍ କରିହେଲା ନାହିଁ।",
      no_notifications:
        "କୌଣସି ବିଜ୍ଞପ୍ତି ନାହିଁ",

      connection_request_sent:
        "ସଂଯୋଗ ଅନୁରୋଧ ପଠାଯାଇଛି!",
      failed_to_send_request:
        "ଅନୁରୋଧ ପଠାଇବା ବିଫଳ ହେଲା",
      request_cancelled:
        "ଅନୁରୋଧ ବାତିଲ୍ ହୋଇଛି",
      failed_to_cancel_request:
        "ଅନୁରୋଧ ବାତିଲ୍ କରିବା ବିଫଳ ହେଲା",

      welcome_employer:
        "ପୁଣିଥରେ ସ୍ୱାଗତ, {{name}} — ଶ୍ରେଷ୍ଠ ପ୍ରାର୍ଥୀଙ୍କୁ ଖୋଜନ୍ତୁ ଏବଂ ସଂଯୋଗ କରନ୍ତୁ।",
      welcome_educator:
        "ପୁଣିଥରେ ସ୍ୱାଗତ, {{name}} — ପାଠ୍ୟକ୍ରମ ପରିଚାଳନା କରନ୍ତୁ ଏବଂ ଶିକ୍ଷାର୍ଥୀଙ୍କୁ ପ୍ରେରଣା ଦିଅନ୍ତୁ।",
      welcome_student:
        "ପୁଣିଥରେ ସ୍ୱାଗତ, {{name}} — ଆପଣଙ୍କ ଦକ୍ଷତା ଅନ୍ତରକୁ କମାଇବା।",

      manage_account_description:
        "ଆପଣଙ୍କ ଖାତା ସୂଚନା ଏବଂ ପସନ୍ଦଗୁଡ଼ିକ ପରିଚାଳନା କରନ୍ତୁ।",
      profile_visibility: "ପ୍ରୋଫାଇଲ୍ ଦୃଶ୍ୟମାନତା",
      visible_to_all_classmates:
        "ସମସ୍ତ ସହପାଠୀଙ୍କୁ ଦେଖାଯିବ",
      private: "ବ୍ୟକ୍ତିଗତ",
      public: "ସାର୍ବଜନୀନ",
      email_address: "ଇମେଲ୍ ଠିକଣା",
      email_read_only:
        "ଇମେଲ୍ ଠିକଣା ଏଠାରେ ବଦଳାଯାଇପାରିବ ନାହିଁ।",
      change_password: "ପାସୱାର୍ଡ ବଦଳାନ୍ତୁ",
      password_reset_coming_soon:
        "ପାସୱାର୍ଡ ରିସେଟ୍ ଶୀଘ୍ର ଉପଲବ୍ଧ ହେବ।",
      change: "ବଦଳାନ୍ତୁ",

      enable_dark_mode: "ଡାର୍କ ମୋଡ୍ ସକ୍ରିୟ କରନ୍ତୁ",
      dark_mode_description:
        "ସମଗ୍ର ଆପ୍ଲିକେସନରେ ଡାର୍କ ମୋଡ୍ ବ୍ୟବହାର କରନ୍ତୁ।",
      learning_reminders: "ଶିକ୍ଷା ସ୍ମରଣିକା",
      receive_task_reminders:
        "ଆପଣଙ୍କ କାର୍ଯ୍ୟ ଏବଂ ସମୟସୀମା ବିଷୟରେ ସ୍ମରଣିକା ପାଆନ୍ତୁ।",

      language: "ଭାଷା",
      choose_preferred_language:
        "ଆପଣଙ୍କ ପସନ୍ଦର ଭାଷା ବାଛନ୍ତୁ।",
      selected_language: "ଚୟନିତ ଭାଷା",
      time_zone: "ସମୟ କ୍ଷେତ୍ର",

      weekly_digest_email:
        "ସାପ୍ତାହିକ ସାରାଂଶ ଇମେଲ୍",
      progress_recommendations:
        "ପ୍ରଗତି ସୁପାରିଶ",
      upcoming_task_notifications:
        "ଆଗାମୀ କାର୍ଯ୍ୟ ବିଜ୍ଞପ୍ତି",
      show_activity_classmates:
        "ମୋ କାର୍ଯ୍ୟକଳାପ ସହପାଠୀଙ୍କୁ ଦେଖାନ୍ତୁ",
      recent_submissions_comments:
        "ସମ୍ପ୍ରତି ଦାଖଲ ଏବଂ ମନ୍ତବ୍ୟ ଦେଖାନ୍ତୁ",
      show_progress_leaderboards:
        "ପ୍ରଗତି ଲିଡରବୋର୍ଡ ଦେଖାନ୍ତୁ",

      theme: "ଥିମ୍",
      choose_application_appearance:
        "ଆପ୍ଲିକେସନର ଦୃଶ୍ୟ ବାଛନ୍ତୁ।",
      light: "ଲାଇଟ୍",
      dark: "ଡାର୍କ",

      changes_saved_successfully:
        "ପରିବର୍ତ୍ତନ ସଫଳତାର ସହିତ ସଂରକ୍ଷିତ ହୋଇଛି।",
      failed_to_save_changes:
        "ପରିବର୍ତ୍ତନ ସଂରକ୍ଷଣ ବିଫଳ ହେଲା।",
      save_changes: "ପରିବର୍ତ୍ତନ ସଂରକ୍ଷଣ କରନ୍ତୁ"
    }
  }
};

const savedLanguage =
  localStorage.getItem("edu_language") || "en-US";

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  fallbackLng: "en-US",
  interpolation: {
    escapeValue: false
  }
});

export default i18n;