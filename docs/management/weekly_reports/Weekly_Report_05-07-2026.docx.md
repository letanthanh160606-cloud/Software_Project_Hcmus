**WEEKLY REPORT**

| Project | Omni Platforms | Reporting period | 05/07/2026 |
| :---- | :---- | :---- | :---- |
| **Prepared by** |  | **Report type** | Weekly progress report |
| **Team / Role** | Leader/PM: ThànhFrontend: Tài LêBackend: Bách Nhuận, Trọng Tài | **Deadline** |  |
| **Main focus** | Role-based login flows; operating environment / tech stack | **Meeting / Source note** | Online meeting via Discord; 20:00–21:30 |

**1\. PROJECT OVERVIEW**

Omni Platforms is a website-based system for managing and distributing automated content for businesses. As of 03/07/2026, the project is being refined around role-based access for Individual users and Business users, where Business users are separated into Supervisor and Member roles.

**2\. WORK COMPLETED THIS WEEK**

* Agreed on two main user groups: Individual and Business. Business users must select either Supervisor or Member.  
* Clarified role responsibilities: Supervisor manages Members and Workspace; Member creates content that requires Supervisor approval before distribution; Individual manages and distributes personal content.  
* Mapped role-based features: Supervisor has Dashboard, Statistics, Post Management, Distribution, and Team Management; Member has Dashboard, My Analytics, My Tasks & Calendar, and Post Management; Individual has Supervisor features except Team Management.  
* Agreed on operating environment / tech stack: React \+ Vite \+ JavaScript, Tailwind CSS, React Router, React Query/Axios; Python \+ FastAPI or Django REST Framework; JWT authentication and role-based authorization; MySQL pending.

**3\. SCOPE / CURRENT FEATURE STATUS**

| Priority / Status | Feature items |
| :---- | :---- |
| **Must-have** | Role-based login and authorization; Supervisor / Member / Individual flows; Dashboard; Statistics / My Analytics; My Tasks & Calendar; Post Management; Distribution; Team Management for Supervisor; operating environment and tech stack documentation |
| **Nice-to-have** |  |
| **Out of scope** |  |

**4\. ONGOING WORK, NEXT PLAN, AND CHALLENGES**

| Category | Details |
| :---- | :---- |
| **Ongoing work** | Figure refinement: adjust figures to match the agreed login flows.Database research: investigate and select a database design platform. |
| **Planned work for next week** | Finalize the operating environment rationale and selected database platform.Consolidate, review, and align all proposal content with the agreed role-based flows. |
| **Issues / Challenges** | Database decision: MySQL is still pending final confirmation.Back-end framework decision: FastAPI or Django REST Framework is still pending.Coordination: 3 / 4 members attended the meeting; Nguyễn Bách Nhuận was absent. |

**5\. OVERALL EVALUATION**

This week focused on clarifying role-based access, role-specific features, the operating environment / tech stack. The next stage should finalize database and back-end decisions, revise the figures, and consolidate all assigned sections into the Project Proposal.