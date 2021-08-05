import { ReactElement, useState, useEffect, useRef } from 'react';
import { OptionsType, OptionTypeBase } from 'react-select';

import { UserStatusCard, LookupLayout } from '@organisms';
import { Filter, UserSelectAutoComplete, SimpleSelect } from '@molecules';
import { Icon } from '@atoms';

import {
  getEachFiltersCodeList,
  postByFilteredUsers,
} from '@repository/filterRepository';
import { useAuthState } from '@store';
import { FILTER_TITLE, OPTIONS } from '@utils/constants';
import { MemberOption } from '@utils/type';

interface Users {
  id: number;
  introduce: string;
  name: string;
  skillList: string[];
  trackList: string[];
}

const sortByOptions: OptionsType<OptionTypeBase> = [
  {
    label: '이름',
    value: 'name',
  },
];

export default function UserStatus(): ReactElement {
  const {
    user: { projectCode, studentNumber },
  } = useAuthState();
  const [filterContents, setFilterContents] = useState<any>();
  const [payload, setPayload] = useState({});

  const [sortAsc, setSortAsc] = useState(true);

  const [users, setUsers] = useState([]);
  // TODO: Search contain
  const [containsUserId, setContainsUserId] = useState<number>();

  useEffect(() => {
    (async () => {
      const {
        data: { data },
      } = await getEachFiltersCodeList();

      setFilterContents(data);
    })();

    setPayload({
      project:
        projectCode?.length > 1 ? projectCode[projectCode.length - 1] : 101,
      studentNumber,
      sort: 'asc',
    });
  }, []);

  useEffect(() => {
    if (
      payload.hasOwnProperty('studentNumber') &&
      payload.hasOwnProperty('project')
    ) {
      (async () => {
        try {
          const {
            data: { data },
          } = await postByFilteredUsers(payload);

          setUsers(data);
        } catch ({
          response: {
            data: { errorMessage },
          },
        }) {
          if (errorMessage === '일치하는 유저가 없습니다') {
            setUsers([]);
          }
        }
      })();
    }
  }, [payload]);

  const handleToggleFilter = (title: string, code: string) => {
    setPayload((prev) => ({ ...prev, [FILTER_TITLE[title]]: code }));
  };

  const handleFilter = (title: string, code: string) => {
    const payloadTemp: any = { ...payload };
    const convertTitle: any = FILTER_TITLE[title];

    if (!payloadTemp.hasOwnProperty(convertTitle)) {
      payloadTemp[convertTitle] = [];
    }

    if (payloadTemp[convertTitle].includes(code)) {
      payloadTemp[convertTitle].splice(
        payloadTemp[convertTitle].indexOf(code),
        1,
      );
    } else {
      payloadTemp[convertTitle].push(code);
    }

    setPayload(payloadTemp);
  };

  const handleChangeUserSelect = (selectedUser: MemberOption | null) => {
    if (selectedUser) {
      setContainsUserId(selectedUser.id);
    } else {
      setContainsUserId(undefined);
    }
  };

  const handleSortByChange = ({ value }: { value: number }) => {
    if (projectCode?.includes(value)) {
      setPayload({ ...payload, project: value });
    }
  };

  const handleClickSort = (sort: string) => {
    setPayload({ ...payload, sort });
    setSortAsc(!sortAsc);
  };

  return (
    <LookupLayout>
      <div className="filter-container">
        <SimpleSelect
          options={OPTIONS.slice(0, 1)} // projectCode?.length)}
          onChange={handleSortByChange}
          value={{ label: '공통', value: 101 }}
        />
        {filterContents &&
          Object.keys(filterContents).map(
            (each, index) =>
              each !== '기수' &&
              each !== '프로젝트' &&
              each !== '역할' &&
              (each !== '전공/비전공' ? (
                <Filter
                  title={each}
                  contents={filterContents[each]}
                  func={handleFilter}
                  key={index}
                />
              ) : (
                <Filter
                  title={each}
                  contents={filterContents[each]}
                  func={handleToggleFilter}
                  key={index}
                  isRadioButton
                />
              )),
          )}
      </div>
      <div className="team-status-list-container">
        <div className="team-status-header">
          <UserSelectAutoComplete
            handleChangeUserSelect={handleChangeUserSelect}
          />
          <div className="sort-container">
            <div className="sort-select">
              <SimpleSelect
                options={sortByOptions}
                onChange={handleSortByChange}
                placeholder={'Sort by...'}
                value={sortByOptions[0]}
              />
            </div>
            <span className={'sort-icon' + (sortAsc ? '' : ' rotated')}>
              <Icon
                iconName="sort"
                func={() => handleClickSort(sortAsc ? 'asc' : 'desc')}
              />
            </span>
          </div>
        </div>
        {users &&
          users.map((each: Users) => (
            <UserStatusCard
              key={each?.id}
              user={each}
              filterContents={filterContents}
            />
          ))}
      </div>
    </LookupLayout>
  );
}
