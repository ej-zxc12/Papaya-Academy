import React from 'react';

const SF10Form: React.FC = () => {
  return (
    <div>
      {/* PAGE 1 */}
      <div style={{ 
        width: '215mm', 
        minHeight: '297mm', 
        margin: '0 auto', 
        padding: '5mm 6mm', 
        background: '#fff', 
        color: '#000',
        fontFamily: 'Arial, sans-serif',
        fontSize: '7pt',
        boxSizing: 'border-box'
      }}>
        {/* PAGE 1 CONTENT */}
        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div style={{ width: '50px' }}>
            <div style={{ fontSize: '7pt', fontWeight: 'bold' }}>SF10-ES</div>
            <img src="/images/foundation/deped-logo.png" alt="DepEd" style={{ width: '44px', height: '44px', marginTop: '2px' }} />
          </div>
          <div style={{ textAlign: 'center', flex: 1, padding: '0 10px' }}>
            <div style={{ fontSize: '8pt', lineHeight: '1.2' }}>Republic of the Philippines</div>
            <div style={{ fontSize: '8pt', lineHeight: '1.2' }}>Department of Education</div>
            <div style={{ fontSize: '11pt', fontWeight: 'bold', lineHeight: '1.3', marginTop: '2px' }}>
              Learner Permanent Academic Record for Elementary School (SF10-ES)
            </div>
            <div style={{ fontSize: '7pt', fontStyle: 'italic', lineHeight: '1.2' }}>(Formerly Form 137)</div>
          </div>
          <div style={{ width: '60px', textAlign: 'right' }}>
            <img src="/images/foundation/depedtextlogo.png" alt="DepED" style={{ width: '55px', height: '48px' }} />
          </div>
        </div>

      {/* LEARNER'S PERSONAL INFORMATION */}
      <div style={{ 
        background: '#d9d9d9', 
        color: '#000', 
        textAlign: 'center', 
        fontWeight: 'bold', 
        fontSize: '7.5pt', 
        padding: '2px 0',
        border: '1px solid #000',
        marginBottom: '2px'
      }}>
        LEARNER'S PERSONAL INFORMATION
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginBottom: '2px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
          <span style={{ fontSize: '6.5pt', whiteSpace: 'nowrap' }}>LAST NAME:</span>
          <div style={{ borderBottom: '1px solid #000', width: '70px', height: '12px' }}></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
          <span style={{ fontSize: '6.5pt', whiteSpace: 'nowrap' }}>FIRST NAME:</span>
          <div style={{ borderBottom: '1px solid #000', width: '70px', height: '12px' }}></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
          <span style={{ fontSize: '6.5pt', whiteSpace: 'nowrap' }}>NAME EXTN. (Jr,I,II)</span>
          <div style={{ borderBottom: '1px solid #000', width: '40px', height: '12px' }}></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
          <span style={{ fontSize: '6.5pt', whiteSpace: 'nowrap' }}>MIDDLE NAME:</span>
          <div style={{ borderBottom: '1px solid #000', width: '70px', height: '12px' }}></div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginBottom: '3px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
          <span style={{ fontSize: '6.5pt', whiteSpace: 'nowrap' }}>Learner Reference Number (LRN):</span>
          <div style={{ borderBottom: '1px solid #000', width: '80px', height: '12px' }}></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
          <span style={{ fontSize: '6.5pt', whiteSpace: 'nowrap' }}>Birthdate (mm/dd/yyyy):</span>
          <div style={{ borderBottom: '1px solid #000', width: '60px', height: '12px' }}></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
          <span style={{ fontSize: '6.5pt', whiteSpace: 'nowrap' }}>Sex:</span>
          <div style={{ borderBottom: '1px solid #000', width: '35px', height: '12px' }}></div>
        </div>
      </div>

      {/* ELIGIBILITY */}
      <div style={{ 
        background: '#d9d9d9', 
        color: '#000', 
        textAlign: 'center', 
        fontWeight: 'bold', 
        fontSize: '7.5pt', 
        padding: '2px 0',
        border: '1px solid #000',
        marginBottom: '2px'
      }}>
        ELIGIBILITY FOR ELEMENTARY SCHOOL ENROLLMENT
      </div>

      <div style={{ fontSize: '6.5pt', marginBottom: '1px' }}>
        <span style={{ fontStyle: 'italic' }}>Credential Presented for Grade 1:</span>
      </div>
      <div style={{ display: 'flex', gap: '15px', fontSize: '6.5pt', marginBottom: '2px' }}>
        <span>☐ Kinder Progress Report</span>
        <span>☐ ECCD Checklist</span>
        <span>☐ Kindergarten Certificate of Completion</span>
      </div>

      <table style={{ width: '100%', fontSize: '6.5pt', marginBottom: '2px' }}>
        <tbody>
          <tr>
            <td style={{ padding: '1px 0' }}>
              <span>Name of School:</span>
              <span style={{ fontWeight: 'bold', marginLeft: '4px' }}>PAPAYA ACADEMY INC.</span>
            </td>
            <td style={{ padding: '1px 0' }}>
              <span>School ID:</span>
              <span style={{ borderBottom: '1px solid #000', display: 'inline-block', width: '40px', marginLeft: '4px' }}></span>
            </td>
          </tr>
          <tr>
            <td style={{ padding: '1px 0' }}>
              <span>Address of School:</span>
              <span style={{ fontWeight: 'bold', marginLeft: '4px' }}>KASIGLAHAN MAIN ROAD, SAN JOSE ROD. RIZAL</span>
            </td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', fontSize: '6.5pt', marginBottom: '1px', flexWrap: 'wrap' }}>
        <span>Other Credential Presented:</span>
        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', flex: 1, height: '11px' }}></span>
      </div>
      <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', fontSize: '6.5pt', flexWrap: 'wrap' }}>
        <span>PEPT Passer Rating:</span>
        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', width: '40px', height: '11px' }}></span>
        <span>Date of Examination/Assessment (mm/dd/yyyy):</span>
        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', width: '60px', height: '11px' }}></span>
        <span>Others (Pls. Specify):</span>
        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', width: '50px', height: '11px' }}></span>
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', fontSize: '6.5pt', marginTop: '1px', flexWrap: 'wrap' }}>
        <span>Name and Address of Testing Center:</span>
        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', flex: 1, height: '11px' }}></span>
        <span>Remark:</span>
        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', width: '50px', height: '11px' }}></span>
      </div>

      {/* SCHOLASTIC RECORD */}
      <div style={{ 
        background: '#d9d9d9', 
        color: '#000', 
        textAlign: 'center', 
        fontWeight: 'bold', 
        fontSize: '7.5pt', 
        padding: '2px 0',
        border: '1px solid #000',
        marginTop: '3px',
        marginBottom: '2px'
      }}>
        SCHOLASTIC RECORD
      </div>

      {/* GRADE BLOCKS - 2x2 Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px' }}>
        
        {/* Block 1: Kinder */}
        <GradeBlock 
          grade="Kinder"
          subjects={['Language', 'Reading and Literacy', 'Mathematics', 'GMRC (Good Manners and Right Conduct)', 'Makabansa']}
          emptyRows={7}
        />

        {/* Block 2: Grade 1 */}
        <GradeBlock 
          grade="Grade 1"
          subjects={['Filipino', 'English', 'Mathematics', 'GMRC (Good Manners and Right Conduct)', 'Makabansa']}
          emptyRows={7}
        />

        {/* Block 3: Grade 2 */}
        <GradeBlock 
          grade="Grade 2"
          subjects={['Filipino', 'English', 'Mathematics', 'Science', 'GMRC (Good Manners and Right Conduct)', 'Makabansa']}
          emptyRows={6}
        />

        {/* Block 4: Grade 3 */}
        <GradeBlock 
          grade="Grade 3"
          subjects={['Filipino', 'English', 'Mathematics', 'Science', 'GMRC (Good Manners and Right Conduct)', 'Araling Panlipunan', 'EPP', 'MAPEH', 'Music & Arts', 'Physical Education & Health']}
          emptyRows={2}
        />

      </div>

      <div style={{ fontSize: '6pt', fontStyle: 'italic', textAlign: 'right', marginTop: '4px' }}>
        Revised 2025 based on DepEd Order No. 10, s. 2024
      </div>
    </div>

    {/* PAGE BREAK */}
    <div style={{ pageBreakAfter: 'always', breakAfter: 'page', height: '1px' }}></div>

    {/* PAGE 2 */}
    <Page2 />
    </div>
  );
};

// Reusable Grade Block Component
const GradeBlock: React.FC<{ grade: string; subjects: string[]; emptyRows: number }> = ({ grade, subjects, emptyRows }) => {
  return (
    <div>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', fontSize: '6.5pt', flexWrap: 'wrap', marginBottom: '1px' }}>
        <span>School:</span>
        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', flex: 1, height: '11px' }}></span>
        <span>School ID:</span>
        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', width: '30px', height: '11px' }}></span>
      </div>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', fontSize: '6.5pt', flexWrap: 'wrap', marginBottom: '1px' }}>
        <span>District:</span>
        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', width: '40px', height: '11px' }}></span>
        <span>Division:</span>
        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', flex: 1, height: '11px' }}></span>
        <span>Region:</span>
        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', width: '25px', height: '11px' }}></span>
      </div>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', fontSize: '6.5pt', flexWrap: 'wrap', marginBottom: '1px' }}>
        <span>Classified as Grade:</span>
        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', width: '20px', height: '11px' }}></span>
        <span>Section:</span>
        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', flex: 1, height: '11px' }}></span>
        <span>School Year:</span>
        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', width: '40px', height: '11px' }}></span>
      </div>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', fontSize: '6.5pt', flexWrap: 'wrap', marginBottom: '2px' }}>
        <span>Name of Adviser/Teacher:</span>
        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', flex: 1, height: '11px' }}></span>
        <span>Signature:</span>
        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', width: '40px', height: '11px' }}></span>
      </div>
      
      <GradeTable subjects={subjects} emptyRows={emptyRows} />
      <RemedialTable />
    </div>
  );
};

// Grade Table Component
const GradeTable: React.FC<{ 
  subjects: string[]; 
  emptyRows: number;
  hasMapehSub?: boolean;
  showZero?: boolean;
}> = ({ subjects, emptyRows, hasMapehSub, showZero }) => {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '6.5pt', tableLayout: 'fixed' }}>
      <thead>
        <tr style={{ background: '#e0e0e0' }}>
          <th rowSpan={2} style={{ 
            border: '1px solid #000', 
            textAlign: 'left', 
            padding: '1px 3px', 
            width: '40%', 
            fontWeight: 'bold',
            fontSize: '6.5pt'
          }}>LEARNING AREAS</th>
          <th colSpan={4} style={{ 
            border: '1px solid #000', 
            textAlign: 'center', 
            fontWeight: 'bold',
            fontSize: '6.5pt'
          }}>Quarterly Rating</th>
          <th rowSpan={2} style={{ 
            border: '1px solid #000', 
            textAlign: 'center', 
            width: '12%',
            fontWeight: 'bold',
            fontSize: '6.5pt'
          }}>Final<br/>Rating</th>
          <th rowSpan={2} style={{ 
            border: '1px solid #000', 
            textAlign: 'center', 
            width: '12%',
            fontWeight: 'bold',
            fontSize: '6.5pt'
          }}>Remarks</th>
        </tr>
        <tr style={{ background: '#e0e0e0' }}>
          <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>1</th>
          <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>2</th>
          <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>3</th>
          <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>4</th>
        </tr>
      </thead>
      <tbody>
        {subjects.map((subject, i) => (
          <tr key={i}>
            <td style={{ 
              border: '1px solid #000', 
              textAlign: 'left', 
              paddingLeft: '3px',
              fontSize: '6.5pt',
              height: '12px'
            }}>{subject}</td>
            <td style={{ border: '1px solid #000' }}></td>
            <td style={{ border: '1px solid #000' }}></td>
            <td style={{ border: '1px solid #000' }}></td>
            <td style={{ border: '1px solid #000' }}></td>
            <td style={{ border: '1px solid #000' }}></td>
            <td style={{ border: '1px solid #000' }}></td>
          </tr>
        ))}
        {Array.from({ length: emptyRows }).map((_, i) => (
          <tr key={`empty-${i}`}>
            <td style={{ border: '1px solid #000', height: '12px' }}></td>
            <td style={{ border: '1px solid #000' }}></td>
            <td style={{ border: '1px solid #000' }}></td>
            <td style={{ border: '1px solid #000' }}></td>
            <td style={{ border: '1px solid #000' }}></td>
            <td style={{ border: '1px solid #000' }}></td>
            <td style={{ border: '1px solid #000' }}></td>
          </tr>
        ))}
        <tr>
          <td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', fontStyle: 'italic', fontSize: '6pt', height: '12px' }}>
            *Arabic Language
          </td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
        </tr>
        <tr>
          <td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', fontStyle: 'italic', fontSize: '6pt', height: '12px' }}>
            *Islamic Values Education
          </td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
        </tr>
        <tr>
          <td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', fontWeight: 'bold', fontSize: '6.5pt', height: '12px' }}>
            General Average
          </td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000', textAlign: 'center' }}>{showZero ? '0' : ''}</td>
          <td style={{ border: '1px solid #000' }}></td>
        </tr>
      </tbody>
    </table>
  );
};

// Remedial Table Component
const RemedialTable: React.FC = () => {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '6.5pt', tableLayout: 'fixed', marginTop: '2px' }}>
      <thead>
        <tr style={{ background: '#e0e0e0' }}>
          <th style={{ border: '1px solid #000', textAlign: 'left', padding: '1px 3px', width: '38%', fontWeight: 'bold', fontSize: '6.5pt' }}>
            Remedial Classes
          </th>
          <th colSpan={2} style={{ border: '1px solid #000', borderRight: 'none', textAlign: 'left', padding: '1px 3px', fontWeight: 'normal', fontSize: '6.5pt' }}>
            <span>Conducted from:</span>
            <span style={{ borderBottom: '1px solid #000', display: 'inline-block', width: '50px', height: '10px', marginLeft: '3px' }}></span>
          </th>
          <th colSpan={2} style={{ border: '1px solid #000', textAlign: 'left', padding: '1px 3px', fontWeight: 'normal', fontSize: '6.5pt' }}>
            <span>to</span>
            <span style={{ borderBottom: '1px solid #000', display: 'inline-block', width: '50px', height: '10px', marginLeft: '3px' }}></span>
          </th>
        </tr>
        <tr style={{ background: '#e0e0e0' }}>
          <th style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', fontWeight: 'bold', fontSize: '6.5pt' }}>LEARNING AREAS</th>
          <th style={{ border: '1px solid #000', textAlign: 'center', width: '15%', fontWeight: 'bold', fontSize: '6.5pt' }}>Final Rating</th>
          <th style={{ border: '1px solid #000', textAlign: 'center', width: '18%', fontWeight: 'bold', fontSize: '6.5pt' }}>Remedial Class Mark</th>
          <th style={{ border: '1px solid #000', textAlign: 'center', width: '20%', fontWeight: 'bold', fontSize: '6.5pt' }}>Recomputed Final Grade</th>
          <th style={{ border: '1px solid #000', textAlign: 'center', width: '12%', fontWeight: 'bold', fontSize: '6.5pt' }}>Remarks</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={{ border: '1px solid #000', height: '12px' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
        </tr>
        <tr>
          <td style={{ border: '1px solid #000', height: '12px' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
          <td style={{ border: '1px solid #000' }}></td>
        </tr>
      </tbody>
    </table>
  );
};

// PAGE 2 Component
const Page2: React.FC = () => {
  return (
    <div style={{ 
      width: '215mm', 
      minHeight: '297mm', 
      margin: '0 auto', 
      padding: '5mm 7mm', 
      background: '#fff', 
      color: '#000',
      fontFamily: 'Arial, sans-serif',
      fontSize: '7pt',
      boxSizing: 'border-box'
    }}>
      {/* TOP BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2px', fontSize: '7pt' }}>
        <span><b>SF10-ES</b></span>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end' }}>
          <span>Page 2 of</span>
          <div style={{ borderBottom: '1px solid #000', minWidth: '30px', height: '12px' }}></div>
        </div>
      </div>

      {/* SCHOLASTIC RECORD TITLE */}
      <div style={{ 
        background: '#000', 
        color: '#fff', 
        textAlign: 'center', 
        fontWeight: 'bold', 
        fontSize: '8pt', 
        padding: '2px 0',
        marginBottom: '3px'
      }}>
        SCHOLASTIC RECORD
      </div>

      {/* ROW 1: Grade 4 (left) | Grade 5 (right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 6px', marginBottom: '4px' }}>
        
        {/* Grade 4 */}
        <Grade4Block />

        {/* Grade 5 */}
        <Grade5Block />

      </div>

      {/* ROW 2: Grade 6/blank (left) | Blank (right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 6px', marginBottom: '4px' }}>
        
        {/* Grade 6 / blank */}
        <Grade6Block />

        {/* Blank right */}
        <BlankGradeBlock />

      </div>

      {/* FOR TRANSFER OUT */}
      <div style={{ fontSize: '7pt', fontStyle: 'italic', margin: '6px 0 3px' }}>
        For Transfer Out /Elementary School Completer Only
      </div>

      {/* CERTIFICATION BOXES */}
      <CertificationBox />
      <CertificationBox />
      <CertificationBox />

      {/* BOTTOM BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '3px' }}>
        <span style={{ fontSize: '6pt', fontStyle: 'italic' }}>May add Certification Box if needed</span>
        <span style={{ fontSize: '6pt' }}>Revised 2025 based on DepEd Order No. 10, s. 2024</span>
      </div>
    </div>
  );
};

// Grade 4 Block
const Grade4Block: React.FC = () => {
  return (
    <div>
      <MetaRow />
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '6.8pt', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ background: '#e0e0e0' }}>
            <th rowSpan={2} style={{ border: '1px solid #000', textAlign: 'left', padding: '1px 3px', width: '42%', fontWeight: 'bold', fontSize: '6.5pt' }}>LEARNING AREAS</th>
            <th colSpan={4} style={{ border: '1px solid #000', textAlign: 'center', fontWeight: 'bold', fontSize: '6.5pt' }}>Quarterly Rating</th>
            <th rowSpan={2} style={{ border: '1px solid #000', textAlign: 'center', width: '12%', fontWeight: 'bold', fontSize: '6.5pt' }}>Final<br/>Rating</th>
            <th rowSpan={2} style={{ border: '1px solid #000', textAlign: 'center', width: '10%', fontWeight: 'bold', fontSize: '6.5pt' }}>Remarks</th>
          </tr>
          <tr style={{ background: '#e0e0e0' }}>
            <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>1</th>
            <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>2</th>
            <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>3</th>
            <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>4</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px' }}>Filipino</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px' }}>English</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px', fontWeight: 'bold' }}>Mathematics</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px' }}>Science</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px' }}>GMRC (Good Manners and Right Conduct)</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px' }}>Araling Panlipunan</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px' }}>EPP</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px', fontWeight: 'bold' }}>MAPEH</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '8px', height: '13px', fontStyle: 'italic', fontSize: '6.5pt' }}>Music &amp; Arts</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '8px', height: '13px', fontStyle: 'italic', fontSize: '6.5pt' }}>Physical Education &amp; Health</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', height: '13px' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', height: '13px' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', height: '13px' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px', fontStyle: 'italic', fontSize: '6.5pt' }}> *Arabic Language</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px', fontStyle: 'italic', fontSize: '6.5pt' }}> *Islamic Values Education</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px', fontWeight: 'bold' }}>General Average</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
        </tbody>
      </table>
      <Page2RemedialTable />
    </div>
  );
};

// Grade 5 Block
const Grade5Block: React.FC = () => {
  return (
    <div>
      <MetaRow />
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '6.8pt', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ background: '#e0e0e0' }}>
            <th rowSpan={2} style={{ border: '1px solid #000', textAlign: 'left', padding: '1px 3px', width: '42%', fontWeight: 'bold', fontSize: '6.5pt' }}>Learning Areas</th>
            <th colSpan={4} style={{ border: '1px solid #000', textAlign: 'center', fontWeight: 'bold', fontSize: '6.5pt' }}>Quarterly Rating</th>
            <th rowSpan={2} style={{ border: '1px solid #000', textAlign: 'center', width: '12%', fontWeight: 'bold', fontSize: '6.5pt' }}>Final<br/>Rating</th>
            <th rowSpan={2} style={{ border: '1px solid #000', textAlign: 'center', width: '10%', fontWeight: 'bold', fontSize: '6.5pt' }}>Remarks</th>
          </tr>
          <tr style={{ background: '#e0e0e0' }}>
            <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>1</th>
            <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>2</th>
            <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>3</th>
            <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>4</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px' }}>Filipino</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px' }}>English</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px', fontWeight: 'bold' }}>Mathematics</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px' }}>Science</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px' }}>GMRC (Good Manners and Right Conduct)</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px' }}>Araling Panlipunan</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px' }}>TLE</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px', fontWeight: 'bold' }}>MAPEH</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '8px', height: '13px', fontStyle: 'italic', fontSize: '6.5pt' }}>Music &amp; Arts</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '8px', height: '13px', fontStyle: 'italic', fontSize: '6.5pt' }}>Physical Education &amp; Health</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', height: '13px' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', height: '13px' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', height: '13px' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px', fontStyle: 'italic', fontSize: '6.5pt' }}> *Arabic Language</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px', fontStyle: 'italic', fontSize: '6.5pt' }}> *Islamic Values Education</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px', fontWeight: 'bold' }}>General Average</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
        </tbody>
      </table>
      <Page2RemedialTable />
    </div>
  );
};

// Grade 6 / Blank Block
const Grade6Block: React.FC = () => {
  return (
    <div>
      <MetaRow />
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '6.8pt', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ background: '#e0e0e0' }}>
            <th rowSpan={2} style={{ border: '1px solid #000', textAlign: 'left', padding: '1px 3px', width: '42%', fontWeight: 'bold', fontSize: '6.5pt' }}>Learning Areas</th>
            <th colSpan={4} style={{ border: '1px solid #000', textAlign: 'center', fontWeight: 'bold', fontSize: '6.5pt' }}>Quarterly Rating</th>
            <th rowSpan={2} style={{ border: '1px solid #000', textAlign: 'center', width: '12%', fontWeight: 'bold', fontSize: '6.5pt' }}>Final<br/>Rating</th>
            <th rowSpan={2} style={{ border: '1px solid #000', textAlign: 'center', width: '10%', fontWeight: 'bold', fontSize: '6.5pt' }}>Remarks</th>
          </tr>
          <tr style={{ background: '#e0e0e0' }}>
            <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>1</th>
            <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>2</th>
            <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>3</th>
            <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>4</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 16 }).map((_, i) => (
            <tr key={i}><td style={{ border: '1px solid #000', height: '13px' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          ))}
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px', fontWeight: 'bold' }}>General Average</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
        </tbody>
      </table>
      <Page2RemedialTable />
    </div>
  );
};

// Blank Grade Block
const BlankGradeBlock: React.FC = () => {
  return (
    <div>
      <MetaRow />
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '6.8pt', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ background: '#e0e0e0' }}>
            <th rowSpan={2} style={{ border: '1px solid #000', textAlign: 'left', padding: '1px 3px', width: '42%', fontWeight: 'bold', fontSize: '6.5pt' }}>Learning Areas</th>
            <th colSpan={4} style={{ border: '1px solid #000', textAlign: 'center', fontWeight: 'bold', fontSize: '6.5pt' }}>Quarterly Rating</th>
            <th rowSpan={2} style={{ border: '1px solid #000', textAlign: 'center', width: '12%', fontWeight: 'bold', fontSize: '6.5pt' }}>Final<br/>Rating</th>
            <th rowSpan={2} style={{ border: '1px solid #000', textAlign: 'center', width: '10%', fontWeight: 'bold', fontSize: '6.5pt' }}>Remarks</th>
          </tr>
          <tr style={{ background: '#e0e0e0' }}>
            <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>1</th>
            <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>2</th>
            <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>3</th>
            <th style={{ border: '1px solid #000', width: '9%', fontWeight: 'bold', fontSize: '6.5pt' }}>4</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 16 }).map((_, i) => (
            <tr key={i}><td style={{ border: '1px solid #000', height: '13px' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          ))}
          <tr><td style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', height: '13px', fontWeight: 'bold' }}>General Average</td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
        </tbody>
      </table>
      <Page2RemedialTable />
    </div>
  );
};

// Meta Row for Page 2
const MetaRow: React.FC = () => {
  return (
    <>
      <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', fontSize: '6.5pt', flexWrap: 'wrap', marginBottom: '1px' }}>
        <span style={{ whiteSpace: 'nowrap' }}>School:</span>
        <div style={{ borderBottom: '1px solid #000', flex: 1, minWidth: '25px', height: '12px' }}></div>
        <span style={{ whiteSpace: 'nowrap' }}>School ID:</span>
        <div style={{ borderBottom: '1px solid #000', minWidth: '30px', height: '12px' }}></div>
      </div>
      <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', fontSize: '6.5pt', flexWrap: 'wrap', marginBottom: '1px' }}>
        <span style={{ whiteSpace: 'nowrap' }}>District:</span>
        <div style={{ borderBottom: '1px solid #000', minWidth: '25px', height: '12px' }}></div>
        <span style={{ whiteSpace: 'nowrap' }}>Division:</span>
        <div style={{ borderBottom: '1px solid #000', flex: 1, height: '12px' }}></div>
        <span style={{ whiteSpace: 'nowrap' }}>Region:</span>
        <div style={{ borderBottom: '1px solid #000', minWidth: '20px', height: '12px' }}></div>
      </div>
      <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', fontSize: '6.5pt', flexWrap: 'wrap', marginBottom: '1px' }}>
        <span style={{ whiteSpace: 'nowrap' }}>Classified as Grade:</span>
        <div style={{ borderBottom: '1px solid #000', minWidth: '18px', height: '12px' }}></div>
        <span style={{ whiteSpace: 'nowrap' }}>Section:</span>
        <div style={{ borderBottom: '1px solid #000', flex: 1, height: '12px' }}></div>
        <span style={{ whiteSpace: 'nowrap' }}>School Year:</span>
        <div style={{ borderBottom: '1px solid #000', minWidth: '28px', height: '12px' }}></div>
      </div>
      <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', fontSize: '6.5pt', flexWrap: 'wrap', marginBottom: '2px' }}>
        <span style={{ whiteSpace: 'nowrap' }}>Name of Adviser/Teacher:</span>
        <div style={{ borderBottom: '1px solid #000', flex: 1, height: '12px' }}></div>
        <span style={{ whiteSpace: 'nowrap' }}>Signature:</span>
        <div style={{ borderBottom: '1px solid #000', minWidth: '35px', height: '12px' }}></div>
      </div>
    </>
  );
};

// Page 2 Remedial Table
const Page2RemedialTable: React.FC = () => {
  return (
    <div style={{ marginTop: '2px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#e0e0e0', border: '1px solid #000', borderBottom: 'none', fontSize: '6.5pt', fontWeight: 'bold', padding: '1px 3px' }}>
        <b>Remedial Classes</b>
        <span>Date Conducted:</span>
        <div style={{ borderBottom: '1px solid #000', minWidth: '28px', height: '11px', flex: 1 }}></div>
        <span>to</span>
        <div style={{ borderBottom: '1px solid #000', minWidth: '28px', height: '11px', flex: 1 }}></div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '6.5pt', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ background: '#e0e0e0' }}>
            <th style={{ border: '1px solid #000', textAlign: 'left', paddingLeft: '3px', width: '40%', fontWeight: 'bold' }}>Learning Areas</th>
            <th style={{ border: '1px solid #000', textAlign: 'center', width: '15%', fontWeight: 'bold' }}>Final Rating</th>
            <th style={{ border: '1px solid #000', textAlign: 'center', width: '20%', fontWeight: 'bold' }}>Remedial Class Mark</th>
            <th style={{ border: '1px solid #000', textAlign: 'center', width: '20%', fontWeight: 'bold' }}>Recomputed Final Grade</th>
            <th style={{ border: '1px solid #000', textAlign: 'center', width: '15%', fontWeight: 'bold' }}>Remarks</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={{ border: '1px solid #000', height: '13px' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
          <tr><td style={{ border: '1px solid #000', height: '13px' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td></tr>
        </tbody>
      </table>
    </div>
  );
};

// Certification Box
const CertificationBox: React.FC = () => {
  return (
    <div style={{ border: '1px solid #000', padding: '4px 6px', marginBottom: '5px' }}>
      <div style={{ background: '#000', color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: '8pt', padding: '2px 0', marginBottom: '4px' }}>
        CERTIFICATION
      </div>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', fontSize: '7pt', marginBottom: '3px', flexWrap: 'wrap' }}>
        <span style={{ whiteSpace: 'nowrap' }}>I CERTIFY that this is a true record of</span>
        <div style={{ borderBottom: '1px solid #000', flex: 1, minWidth: '40px', height: '13px' }}></div>
        <span style={{ whiteSpace: 'nowrap' }}>with LRN</span>
        <div style={{ borderBottom: '1px solid #000', minWidth: '60px', height: '13px' }}></div>
        <span style={{ whiteSpace: 'nowrap' }}>and that he/she is eligible for addmision to Grade</span>
        <div style={{ borderBottom: '1px solid #000', minWidth: '25px', height: '13px' }}></div>
        <span>.</span>
      </div>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', fontSize: '7pt', marginBottom: '3px', flexWrap: 'wrap' }}>
        <span style={{ whiteSpace: 'nowrap' }}>School Name:</span>
        <div style={{ borderBottom: '1px solid #000', minWidth: '100px', height: '13px' }}></div>
        <span style={{ whiteSpace: 'nowrap' }}>School ID</span>
        <div style={{ borderBottom: '1px solid #000', minWidth: '50px', height: '13px' }}></div>
        <span style={{ whiteSpace: 'nowrap' }}>Division</span>
        <div style={{ borderBottom: '1px solid #000', minWidth: '70px', height: '13px' }}></div>
        <span style={{ whiteSpace: 'nowrap' }}>Last School Year Attended:</span>
        <div style={{ borderBottom: '1px solid #000', minWidth: '60px', height: '13px' }}></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px', fontSize: '7pt', gap: '10px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderTop: '1px solid #000', minWidth: '120px', marginTop: '14px' }}></div>
          <div style={{ fontSize: '6.5pt' }}>Date</div>
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ borderTop: '1px solid #000', margin: '14px auto 0', minWidth: '240px' }}></div>
          <div style={{ fontSize: '6.5pt' }}>Signature of Principal/School Head over Printed Name</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ border: '1px solid #000', width: '90px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6pt', color: '#555' }}>(Affix School Seal here)</div>
        </div>
      </div>
    </div>
  );
};

export default SF10Form;
