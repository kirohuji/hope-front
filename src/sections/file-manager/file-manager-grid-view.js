import PropTypes from 'prop-types';
import { useState, useRef, useCallback } from 'react';
// @mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Iconify from 'src/components/iconify';
//
import FileManagerPanel from './file-manager-panel';
import FileManagerFileItem from './file-manager-file-item';
import FileManagerFolderItem from './file-manager-folder-item';
import FileManagerActionSelected from './file-manager-action-selected';
import FileManagerShareDialog from './file-manager-share-dialog';
import FileManagerNewFolderDialog from './file-manager-new-folder-dialog';

// ----------------------------------------------------------------------

export default function FileManagerGridView({
  table,
  data,
  onRefresh,
  dataFiltered,
  onDeleteItem,
  onOpenConfirm,
}) {
  const { selected, onSelectRow: onSelectItem, onSelectAllRows: onSelectAllItems } = table;

  const containerRef = useRef(null);

  const [folderName, setFolderName] = useState('');

  const [inviteEmail, setInviteEmail] = useState('');

  const share = useBoolean();

  const newFolder = useBoolean();

  const upload = useBoolean();

  const files = useBoolean();

  const folders = useBoolean();

  const handleChangeInvite = useCallback((event) => {
    setInviteEmail(event.target.value);
  }, []);

  const handleChangeFolderName = useCallback((event) => {
    setFolderName(event.target.value);
  }, []);

  return (
    <>
      <Box ref={containerRef}>
        <FileManagerPanel
          title="文件夹"
          subTitle={`${data.filter((item) => item.type === 'folder').length} 文件夹`}
          onOpen={newFolder.onTrue}
          collapse={folders.value}
          onCollapse={folders.onToggle}
        />

        <Collapse in={!folders.value} unmountOnExit>
          <Box
            gap={3}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            }}
          >
            {dataFiltered
              .filter((i) => i.type === 'folder')
              .map((folder) => (
                <FileManagerFolderItem
                  key={folder._id}
                  folder={folder}
                  selected={selected.includes(folder._id)}
                  onSelect={() => onSelectItem(folder._id)}
                  onDelete={() => onDeleteItem(folder._id)}
                  sx={{ maxWidth: 'auto' }}
                />
              ))}
          </Box>
        </Collapse>

        <Divider sx={{ my: 5, borderStyle: 'dashed' }} />

        <FileManagerPanel
          title="文件"
          subTitle={`${data.filter((item) => item.type !== 'folder').length} 文件`}
          onOpen={upload.onTrue}
          collapse={files.value}
          onCollapse={files.onToggle}
        />

        <Collapse in={!files.value} unmountOnExit>
          <Box
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            }}
            gap={3}
          >
            {dataFiltered
              .filter((i) => i.type !== 'folder')
              .map((file) => (
                <FileManagerFileItem
                  key={file._id}
                  file={file}
                  selected={selected.includes(file._id)}
                  onSelect={() => onSelectItem(file._id)}
                  onDelete={() => onDeleteItem(file._id)}
                  sx={{ maxWidth: 'auto' }}
                />
              ))}
          </Box>
        </Collapse>

        {!!selected?.length && (
          <FileManagerActionSelected
            numSelected={selected.length}
            rowCount={data.length}
            selected={selected}
            onSelectAllItems={(checked) =>
              onSelectAllItems(
                checked,
                data.map((row) => row._id)
              )
            }
            action={
              <>
                <Button
                  size="small"
                  color="error"
                  variant="contained"
                  startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                  onClick={onOpenConfirm}
                  sx={{ mr: 1 }}
                >
                  删除
                </Button>

                <Button
                  color="primary"
                  size="small"
                  variant="contained"
                  startIcon={<Iconify icon="solar:share-bold" />}
                  onClick={share.onTrue}
                >
                  Share
                </Button>
              </>
            }
          />
        )}
      </Box>

      <FileManagerShareDialog
        open={share.value}
        inviteEmail={inviteEmail}
        onChangeInvite={handleChangeInvite}
        onClose={() => {
          share.onFalse();
          setInviteEmail('');
        }}
      />

      <FileManagerNewFolderDialog open={upload.value} onClose={()=>{
        onRefresh();
        upload.onFalse()
      }} />

      <FileManagerNewFolderDialog
        open={newFolder.value}
        onClose={newFolder.onFalse}
        title="New Folder"
        onCreate={() => {
          newFolder.onFalse();
          setFolderName('');
          console.info('CREATE NEW FOLDER', folderName);
        }}
        folderName={folderName}
        onChangeFolderName={handleChangeFolderName}
      />
    </>
  );
}

FileManagerGridView.propTypes = {
  data: PropTypes.array,
  dataFiltered: PropTypes.array,
  onDeleteItem: PropTypes.func,
  onRefresh: PropTypes.func,
  onOpenConfirm: PropTypes.func,
  table: PropTypes.object,
};
