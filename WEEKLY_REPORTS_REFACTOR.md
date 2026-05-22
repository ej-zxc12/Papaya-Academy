# Weekly Reports System Refactor - Google Classroom Model

## Overview
The weekly reports system has been refactored to use a Google Classroom assignment model, where Principals create primary posts (assignments) and Teachers submit their reports as sub-posts under those assignments.

## Database Schema Changes

### New Collections
1. **weekly_report_primary_posts** - Stores assignment requests created by Principals
   - Fields: id, title, description, createdBy, createdByName, dueDate, createdAt, isActive, schoolYear

2. **weekly_report_sub_posts** - Stores teacher submissions linked to primary posts
   - Fields: id, primaryPostId, teacherId, teacherName, content, attachments, submittedAt, acknowledged, acknowledgedBy, acknowledgedAt

### Type Definitions (types/index.ts)
- `WeeklyReportPrimaryPost` - Interface for primary posts
- `WeeklyReportSubPost` - Interface for teacher submissions
- `TeacherCompletionStatus` - Interface for tracking teacher completion status

## API Routes Created

### 1. `/api/weekly-reports/primary-posts`
- **GET**: Fetch all primary posts (with optional `isActive` filter)
- **POST**: Create a new primary post (assignment)
- **PATCH**: Update a primary post (e.g., deactivate)

### 2. `/api/weekly-reports/sub-posts`
- **GET**: Fetch sub-posts for a specific primary post (with optional `teacherId` filter)
- **POST**: Create a new sub-post (teacher submits report)
- **PATCH**: Update a sub-post (e.g., acknowledge)

### 3. `/api/weekly-reports/teachers`
- **GET**: Fetch all teachers for the tracking section

### 4. `/api/weekly-reports/tracking`
- **GET**: Fetch teacher completion status for a specific primary post

## Frontend Changes

### Principal Portal (`app/principal/weekly-reports/page.tsx`)
**New Features:**
- Create primary posts (assignments) with title, description, and due date
- View list of active assignments
- Select an assignment to view details
- **Teacher Completion Tracking Section:**
  - Displays all teacher accounts
  - Visual status indicator (green checkmark for completed, gray circle for pending)
  - Shows submission timestamp for completed teachers
  - Summary statistics (total, submitted, pending)
- View submitted reports for the selected assignment
- Acknowledge teacher submissions

**UI Components:**
- Assignment creation form with validation
- Assignment list with selection indicator
- Teacher tracking grid with status indicators
- Submitted reports viewer with acknowledgment buttons

### Teacher Portal (`app/teacher/weekly-reports/page.tsx`)
**New Features:**
- View active assignments created by Principal
- Select an assignment to view details
- Submit reports directly inside the selected assignment
- View own submitted report status
- See acknowledgment status from Principal
- Attach files to reports

**UI Components:**
- Assignment list with selection indicator
- Report submission form with file attachment
- Deadline countdown card
- Submitted report viewer with acknowledgment status

## Key Features Implemented

### 1. Hierarchical Post Structure
- Primary posts (assignments) created by Principals
- Sub-posts (reports) submitted by Teachers under primary posts
- One-to-many relationship between primary posts and sub-posts

### 2. Teacher Completion Tracking
- Real-time tracking of which teachers have submitted
- Visual status indicators (completed/pending)
- Submission timestamps
- Summary statistics

### 3. Acknowledgment System
- Principals can acknowledge teacher submissions
- Teachers can see acknowledgment status
- Timestamp for acknowledgment

### 4. File Attachments
- Teachers can attach files to their reports
- Files stored in Firebase Storage
- Downloadable links for attachments

### 5. Deadline Management
- Automatic deadline calculation (next Friday at 5 PM)
- Countdown display
- Visual urgency indicators

## Migration Notes

### Old Files Preserved
- `app/principal/weekly-reports/page-old.tsx` - Original Principal page
- `app/teacher/weekly-reports/page-old.tsx` - Original Teacher page

### Backward Compatibility
- The old `weekly_reports` collection is still used for the legacy system
- New system uses separate collections (`weekly_report_primary_posts`, `weekly_report_sub_posts`)
- Both systems can coexist if needed for migration

## Testing Checklist

### Principal Portal
- [ ] Create a new primary post (assignment)
- [ ] View list of active assignments
- [ ] Select an assignment and view tracking
- [ ] See teacher completion status indicators
- [ ] View submitted reports
- [ ] Acknowledge a teacher submission
- [ ] Deactivate an assignment

### Teacher Portal
- [ ] View active assignments
- [ ] Select an assignment
- [ ] Submit a report with content
- [ ] Attach files to report
- [ ] View own submitted report
- [ ] See acknowledgment status from Principal

### Integration
- [ ] Principal creates assignment
- [ ] Teacher sees assignment in their portal
- [ ] Teacher submits report
- [ ] Principal sees teacher's submission in tracking
- [ ] Principal acknowledges submission
- [ ] Teacher sees acknowledgment status

## Enterprise-Grade Standards

### Code Quality
- TypeScript interfaces for all data structures
- Proper error handling in API routes
- Input validation on all endpoints
- Consistent naming conventions

### Security
- Session-based authentication
- Role-based access control
- File upload validation
- SQL injection prevention (using Firestore)

### Performance
- Efficient database queries with proper indexing
- Client-side caching where appropriate
- Optimistic UI updates
- Loading states for better UX

### User Experience
- Clear visual feedback
- Loading indicators
- Error messages
- Responsive design
- Accessible components

## Future Enhancements

### Potential Improvements
- Email notifications for new assignments
- Email notifications for acknowledgments
- Bulk acknowledgment feature
- Export completion status to CSV
- Assignment templates
- Recurring assignments
- Comment threads on submissions
- Report history and versioning
- Advanced filtering and search

### Database Considerations
- Add Firestore indexes for better query performance
- Consider data retention policies
- Implement soft delete for assignments
- Add audit logging
