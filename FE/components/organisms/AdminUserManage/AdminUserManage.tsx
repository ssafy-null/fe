import { useState, useEffect } from 'react';
import styled from 'styled-components';

import { Text, Icon } from '@atoms';
import { ReactTable } from '@molecules';
import { AdminUserManageModal } from '@organisms';
import { getTableData } from '@repository/adminRepository';
import { ADMIN_DASHBOARD_TABLE_COLUMNS } from '@utils/constants';

const Wrapper = styled.div`
  i {
    cursor: pointer;
  }
  .manage-header {
    display: flex;
    align-items: center;
    margin: 20px 0;
    > div {
      margin-right: 10px;
    }
    > i {
      font-size: 30px;
    }
  }
`;

interface AdminUserManageProps {
  projectId: number;
}

export default function AdminUserManage({ projectId }: AdminUserManageProps) {
  const [teamStatusTableData, setTeamStatusTableData] = useState<any[]>([]);
  const [showCreateModal, setCreateShowModal] = useState(false);
  const [editable, setEditable] = useState(false);

  useEffect(() => {
    getTableData({ projectId }).then(({ data: { data } }) => {
      setTeamStatusTableData(data);
    });
  }, [projectId]);

  return (
    <Wrapper>
      <div className="manage-header">
        <Text text="교육생 목록" fontSetting="n26b" />
        <Icon iconName="add_box" func={() => setCreateShowModal(true)} />
        <Icon
          iconName="settings_applications"
          func={() => setEditable(!editable)}
        />
      </div>
      <ReactTable
        data={teamStatusTableData}
        columns={ADMIN_DASHBOARD_TABLE_COLUMNS}
        fullWidth={false}
        selectable={editable}
        onSelectRow={(row) => console.log(row)}
      />
      {showCreateModal && (
        <AdminUserManageModal
          handleClickClose={() => setCreateShowModal(false)}
        />
      )}
    </Wrapper>
  );
}
