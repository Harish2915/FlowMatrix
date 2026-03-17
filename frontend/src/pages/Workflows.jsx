import { useState } from 'react'
import AppLayout from '../components/AppLayout'
import WorkflowList from '../components/WorkflowList'
import WorkflowEditor from '../components/WorkflowEditor'

export default function Workflows() {
  const [showEditor, setShowEditor] = useState(false)
  const [editWorkflow, setEditWorkflow] = useState(null)
  const [refresh, setRefresh] = useState(0)

  const handleEdit = (wf) => { setEditWorkflow(wf); setShowEditor(true) }
  const handleCreate = () => { setEditWorkflow(null); setShowEditor(true) }
  const handleSave = () => { setRefresh(r => r + 1); setShowEditor(false); setEditWorkflow(null) }

  return (
    <AppLayout title="Workflows">
      {/* Page header */}
      <div className="row align-items-center mb-4 g-2">
        <div className="col-12 col-sm">
          <h1 className="page-title mb-1">Workflows</h1>
          <p className="page-subtitle mb-0">Create and manage your automation workflows</p>
        </div>
        <div className="col-12 col-sm-auto">
          <button className="btn btn-primary w-100 w-sm-auto" onClick={handleCreate}>
            <i className="bi bi-plus-lg me-1" />New Workflow
          </button>
        </div>
      </div>

      {/* List card */}
      <div className="card">
        <div className="card-header">
          <h6 className="card-title">
            <i className="bi bi-diagram-3 text-accent" />
            All Workflows
          </h6>
        </div>
        <div className="card-body p-0 p-md-3">
          <WorkflowList onEdit={handleEdit} onRefresh={handleSave} refresh={refresh} />
        </div>
      </div>

      {showEditor && (
        <WorkflowEditor
          workflow={editWorkflow}
          onSave={handleSave}
          onClose={() => { setShowEditor(false); setEditWorkflow(null) }}
        />
      )}
    </AppLayout>
  )
}