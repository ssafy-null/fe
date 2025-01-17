import { useState, useEffect, ChangeEventHandler } from 'react';
import styled from 'styled-components';
import { AxiosError } from 'axios';

import { Text, Icon } from '@atoms';
import { ReactTable, Button } from '@molecules';
import {
  getProjectUserTableData,
  addStudentToProject,
  excludeStudentFromProject,
  exportUserData,
  importUserData,
  importUserClassSetting,
} from '@repository/adminRepository';
import { Project } from '@utils/type';
import AdminProjectUserDeleteModal from './AdminProjectUserDeleteModal';
import AdminProjectUserAddModal from './AdminProjectUserAddModal';
import AdminUserClassSettingModal from './AdminUserClassSettingModal';
import AdminUserImportModal from './AdminUserImportModal';
import AdminUserExportModal from './AdminUserExportModal';
import { setLoading, useAppDispatch } from '@store';
import { errorAlert, myAlert } from '@utils/snippet';

const Wrapper = styled.div`
  i {
    cursor: pointer;
  }

  .manage-header {
    display: flex;
    align-items: center;
    margin: 20px 0;
    justify-content: space-between;

    > div {
      display: inline-flex;
      align-items: center;
      > i {
        font-size: 30px;
      }
      > div {
        margin-right: 10px;
      }
    }

    .manage-header-import {
      > button {
        padding: 0 15px;
        box-shadow: none;
        margin-left: 10px;
      }
    }
  }

  .region-btns {
    margin-bottom: 20px;
  }
`;

interface UserDataRow {
  userId: number;
  completeYn: string | null;
  major: string;
  name: string;
  region: string;
  regist: string;
  role: string;
  studentClass: string;
  studentNumber: string;
  teamId: number | null;
  teamName: string | null;
  email: string;
}

interface AdminUserManageProps {
  project: Project;
}

export default function AdminProjectUserManage({
  project,
}: AdminUserManageProps) {
  const dispatch = useAppDispatch();
  const [userTableData, setUserTableData] = useState<UserDataRow[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showClassSettingModal, setShowClassSettingModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editable, setEditable] = useState(false);
  const [editTarget, setEditTarget] = useState<UserDataRow>();

  useEffect(() => {
    fetchProjectUserTableData();
  }, [project]);

  const fetchProjectUserTableData = () => {
    dispatch(setLoading({ isLoading: true }));
    getProjectUserTableData({
      projectId: project.id,
    }).then(({ data: { data } }) => {
      setUserTableData(data);
    }).finally(() => {
      dispatch(setLoading({ isLoading: false }));
    });
  };

  const handleSelectedRow = (row: { type: string; data: UserDataRow }) => {
    if (row.type === 'delete') {
      setShowDeleteModal(true);
      setEditTarget(row.data);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setEditTarget(undefined);
  };

  const deleteUser = () => {
    dispatch(setLoading({ isLoading: true }));

    if (editTarget && editTarget.userId) {
      excludeStudentFromProject({
        projectId: project.id,
        userId: editTarget.userId,
      })
        .then(() => {
          fetchProjectUserTableData();
        })
        .catch((err) => {
          errorAlert(dispatch, err);
        })
        .finally(() => {
          closeDeleteModal();
          dispatch(setLoading({ isLoading: false }));
        });
    } else {
      myAlert(dispatch, '삭제할 행이 선택되지 않았습니다.');
    }
  };

  const addUser = (userId: number) => {
    dispatch(setLoading({ isLoading: true }));
    addStudentToProject({
      projectId: project.id,
      userId,
    })
      .then(({ data: { data } }) => {
        setUserTableData(data);
      })
      .finally(() => {
        setShowAddModal(false);
        dispatch(setLoading({ isLoading: false }));
      });
  };

  const base64ToArrayBuffer = (base64: string) => {
    const binaryString = window.atob(base64);
    const binaryLen = binaryString.length;
    const bytes = new Uint8Array(binaryLen);
    for (let i = 0; i < binaryLen; i++) {
      const ascii = binaryString.charCodeAt(i);
      bytes[i] = ascii;
    }
    return bytes;
  };

  const downloadUserExport = () => {
    dispatch(setLoading({ isLoading: true }));
    exportUserData({
      project_code: project.project.code,
      stage_code: project.stage.code,
    })
      .then(({ data: { data } }) => {
        const arrayBuffer = base64ToArrayBuffer(data);
        const a = window.document.createElement('a');

        a.href = window.URL.createObjectURL(
          new Blob([arrayBuffer], { type: 'application/vnd.ms-excel' }),
        );
        a.download = 'export.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      })
      .catch((err) => {
        errorAlert(dispatch, err);
      })
      .finally(() => {
        setShowExportModal(false);
        dispatch(setLoading({ isLoading: false }));
      });
  };

  const uploadUserImport: ChangeEventHandler<HTMLInputElement> = (event: {
    target: HTMLInputElement;
  }) => {
    if (event.target.files && event.target.files.length > 0 && project.id) {
      dispatch(setLoading({ isLoading: true }));

      const formData = new FormData();
      formData.append('file', event.target.files[0]);
      formData.append(
        'project_id',
        new Blob([project.id + ''], { type: 'application/json' }),
      );

      importUserData(formData)
        .then(() => {
          fetchProjectUserTableData();
        })
        .catch((err) => {
          errorAlert(dispatch, err);
        })
        .finally(() => {
          setShowImportModal(false);
          dispatch(setLoading({ isLoading: false }));
        });
    }
  };

  const uploadUserClassSetting: ChangeEventHandler<HTMLInputElement> = (event: {
    target: HTMLInputElement;
  }) => {
    if (event.target.files && event.target.files.length > 0 && project.id) {
      dispatch(setLoading({ isLoading: true }));

      const formData = new FormData();
      formData.append('file', event.target.files[0]);
      formData.append(
        'project_id',
        new Blob([project.id + ''], { type: 'application/json' }),
      );

      importUserClassSetting(formData)
        .then(() => {
          fetchProjectUserTableData();
        })
        .catch((err) => {
          errorAlert(dispatch, err);
        })
        .finally(() => {
          setShowClassSettingModal(false);
          dispatch(setLoading({ isLoading: false }));
        });
    }
  };

  return (
    <Wrapper>
      <div className="manage-header">
        <div>
          <Text
            text={`${project.name || '현재 프로젝트'} 교육생 목록`}
            fontSetting="n26b"
          />
          <Icon iconName="add_box" func={() => setShowAddModal(true)} />
          <Icon
            iconName="settings_applications"
            func={() => setEditable(!editable)}
          />
        </div>

        <div className="manage-header-import">
          {/* 기능 미구현 */}
          {/* <Button
            title="반 설정"
            func={() => setShowClassSettingModal(true)}
            width="auto"
          /> */}
          <Button
            title="Import"
            func={() => setShowImportModal(true)}
            width="auto"
          />
          <Button
            title="Export"
            func={() => setShowExportModal(true)}
            width="auto"
          />
        </div>
      </div>
      <ReactTable
        data={userTableData}
        columns={ADMIN_USER_TABLE_COLUMNS}
        selectable={{
          selectable: editable,
          type: { edit: false, delete: true },
        }}
        onSelectRow={handleSelectedRow}
        pagination={false}
      />

      {showClassSettingModal && (
        <AdminUserClassSettingModal
          handleClickClose={() => setShowClassSettingModal(false)}
          handleImportExcel={uploadUserClassSetting}
        />
      )}

      {showImportModal && (
        <AdminUserImportModal
          handleClickClose={() => setShowImportModal(false)}
          handleImportExcel={uploadUserImport}
        />
      )}

      {showExportModal && (
        <AdminUserExportModal
          projectName={project.name}
          handleClickClose={() => setShowExportModal(false)}
          handleClickDownload={downloadUserExport}
        />
      )}

      {showDeleteModal && editTarget && (
        <AdminProjectUserDeleteModal
          studnetName={editTarget.name}
          handleClickClose={closeDeleteModal}
          handleClickDelete={deleteUser}
        />
      )}

      {showAddModal && project.id && (
        <AdminProjectUserAddModal
          projectId={project.id}
          handleClickClose={() => setShowAddModal(false)}
          handleClickAdd={addUser}
        />
      )}
    </Wrapper>
  );
}

const ADMIN_USER_TABLE_COLUMNS = [
  {
    Header: '#',
    width: 30,
    disableGroupBy: true,
    disableSortBy: true,
    disableFilters: true,
    Cell: (content: any) => {
      return (
        <div style={{ textAlign: 'center' }}>
          {content.row.id && !isNaN(parseInt(content.row.id))
            ? parseInt(content.row.id) + 1
            : ' '}
        </div>
      );
    },
  },
  {
    Header: '학번',
    accessor: 'studentNumber',
    disableGroupBy: true,
    width: 80,
    Cell: (content: any) => (
      <div style={{ textAlign: 'center' }}>{content.value}</div>
    ),
  },
  {
    Header: '이름',
    accessor: 'name',
    disableGroupBy: true,
    width: 100,
    Cell: (content: any) => (
      <div style={{ textAlign: 'center' }}>{content.value}</div>
    ),
  },
  {
    Header: '지역',
    accessor: 'region',
    width: 70,
    Cell: (content: any) => (
      <div style={{ textAlign: 'center' }}>{content.value}</div>
    ),
  },
  {
    Header: '반',
    accessor: 'studentClass',
    width: 110,
    Cell: (content: any) => (
      <div style={{ textAlign: 'center' }}>{content.value}</div>
    ),
  },
  {
    Header: '팀 유무',
    accessor: 'teamYn',
    width: 80,
    Cell: (content: any) => (
      <div style={{ textAlign: 'center' }}>{content.value}</div>
    ),
  },
  {
    Header: '팀 번호',
    accessor: 'teamId',
    width: 120,
    Cell: (content: any) => (
      <div style={{ textAlign: 'center' }}>{content.value}</div>
    ),
  },
  {
    Header: '리더 여부',
    accessor: 'leaderYn',
    width: 120,
    Cell: (content: any) => (
      <div style={{ textAlign: 'center' }}>{content.value}</div>
    ),
  },
  {
    Header: '전공 여부',
    accessor: 'major',
    width: 120,
    Cell: (content: any) => (
      <div style={{ textAlign: 'center' }}>{content.value}</div>
    ),
  },
  {
    Header: '희망 포지션',
    accessor: 'position',
    width: 180,
    Cell: (content: any) => (
      <div style={{ textAlign: 'center' }}>{content.value}</div>
    ),
  },
];
