import { useEffect, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
// @mui
import Grid from '@mui/material/Unstable_Grid2';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { RouterLink } from 'src/routes/components';
import Stack from '@mui/material/Stack';

// bmpn
import BpmnModeler from 'bpmn-js/lib/Modeler';
import camundaModdle from 'camunda-bpmn-moddle/resources/camunda.json';
import {
  ElementTemplatesPropertiesProviderModule, // Camunda 7 Element Templates
} from 'bpmn-js-element-templates';

import elementTemplateChooserModule from '@bpmn-io/element-template-chooser';
import { BpmnPropertiesPanelModule, BpmnPropertiesProviderModule } from 'bpmn-js-properties-panel';
import { useSelector } from 'src/redux/store';
import _ from 'lodash';
import minimapModule from 'diagram-js-minimap';
import TokenSimulationModule from 'bpmn-js-token-simulation';
import templateIconRendererModule from '@bpmn-io/element-templates-icons-renderer';
import addExporterModule from '@bpmn-io/add-exporter';
import gridModule from 'diagram-js-grid';
// 右键菜单 & 工具栏扩展
import contextPadModule from 'bpmn-js/lib/features/context-pad';
import customControlsModule from 'bpmn-js/lib/features/palette';
import modelingModule from 'bpmn-js/lib/features/modeling';
import keyboardModule from 'diagram-js/lib/features/keyboard';
import { bpmnService } from 'src/composables/context-provider';
import zhCN from './resources/zn';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import 'diagram-js-minimap/assets/diagram-js-minimap.css';
import '@bpmn-io/element-template-chooser/dist/element-template-chooser.css';
import '@bpmn-io/properties-panel/assets/properties-panel.css';
import 'bpmn-js-token-simulation/assets/css/bpmn-js-token-simulation.css';
import 'bpmn-js-connectors-extension/dist/connectors-extension.css';
import diagramXML from './resources/newDiagram.bpmn';
import './bpmn-new-edit-form.css';
import BpmnForm from './bpmn-form';

export const status = [
  { value: 'all', label: '全部' },
  { value: 'approved', label: '已审核' },
  { value: 'in_review', label: '正在审核' },
  { value: 'rejected', label: '未通过' },
  { value: 'withdrawn', label: '已撤回' },
];

export const categories = [
  { value: '活动通知', label: '活动通知' },
  { value: '消息公告', label: '消息公告' },
  { value: '社交聚会', label: '社交聚会' },
];

function customTranslate(template, replacements) {
  replacements = replacements || {};

  // Translate
  template = zhCN[template] || template;

  // Replace
  return template.replace(/{([^}]+)}/g, (i, key) => replacements[key] || `{${key}}`);
}

const translate = {
  translate: ['value', customTranslate],
};
export default function BpmnNewEditForm({ backLink, currentBpmn, sx, ...other }) {
  const bpmnModeler = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const propertiesRef = useRef(null);
  const { enqueueSnackbar } = useSnackbar();
  const scope = useSelector((state) => state.scope);
  const [currentForm, setCurrentForm] = useState({});
  const [openForm, setOpenForm] = useState(false);
  const handleOpenFormModal = () => {
    setCurrentForm(_.pick(currentBpmn, ['_id', 'id', 'label', 'value', 'description', 'scope']));
    setOpenForm(true);
  };

  const handleExecute = () => {
    bpmnService.execute({
      source: currentForm.content || currentBpmn.content,
      variables: {},
    });
  };

  const onSave = async (form) => {
    const updatedForm = { ...currentForm, ...form };
    setCurrentForm(updatedForm);
    if (!currentBpmn._id) {
      try {
        const { xml } = await bpmnModeler.current.saveXML({ format: true });
        await bpmnService.post({
          ...updatedForm,
          content: xml,
          scope: scope.active._id,
        });
        enqueueSnackbar('新增成功');
      } catch (e) {
        enqueueSnackbar(e.response.data.message);
      }
    }
    handleCloseFormModal();
  };

  const onUpload = async () => {
    if (currentBpmn._id) {
      try {
        const { xml } = await bpmnModeler.current.saveXML({ format: true });
        await bpmnService.put({
          ..._.pick(currentBpmn, ['_id', 'id', 'label', 'value', 'description', 'scope']),
          ...currentForm,
          content: xml,
        });
        enqueueSnackbar('修改成功');
      } catch (e) {
        enqueueSnackbar(e.response.data.message);
      }
    } else {
      handleOpenFormModal();
    }
  };

  const handleCloseFormModal = () => {
    setOpenForm(false);
  };
  async function openDiagram(xml) {
    if (bpmnModeler.current) {
      try {
        const response = await fetch(xml);
        if (!response.ok) throw new Error('Failed to fetch BPMN file');
        const text = await response.text();
        await bpmnModeler.current.importXML(text);
      } catch (err) {
        console.error('Failed to load diagram:', err);
      }
    }
  }
  async function newDiagram(text) {
    if (bpmnModeler.current) {
      try {
        await bpmnModeler.current.importXML(text);
      } catch (err) {
        console.error('Failed to load diagram:', err);
      }
    }
  }
  const init = useCallback(() => {
    if (canvasRef.current) {
      bpmnModeler.current = new BpmnModeler({
        container: canvasRef.current,
        propertiesPanel: {
          parent: propertiesRef.current,
        },
        additionalModules: [
          minimapModule,
          addExporterModule,
          ElementTemplatesPropertiesProviderModule,
          elementTemplateChooserModule,
          templateIconRendererModule,
          contextPadModule, // 右键菜单
          customControlsModule, // 自定义工具栏
          modelingModule, // 拖拽 & 连接增强
          keyboardModule, // 快捷键支持
          TokenSimulationModule,
          gridModule,
          translate,
          BpmnPropertiesPanelModule,
          BpmnPropertiesProviderModule,
        ],
        moddleExtensions: {
          camunda: camundaModdle,
        },
        exporter: {
          name: 'bpmn-js-token-simulation',
          version: '0.37.0',
        },
      });
      if (currentBpmn.content && currentBpmn._id) {
        newDiagram(currentBpmn.content);
      } else {
        setCurrentForm(currentBpmn);
        openDiagram(diagramXML);
      }
    }
  }, [currentBpmn]);

  useEffect(() => {
    init();
  }, [init]);
  const renderActions = (
    <Stack
      spacing={1.5}
      direction="row"
      sx={{
        mb: { xs: 3, md: 5, width: '100%' },
        ...sx,
        display: 'flex',
        justifyContent: 'space-between',
      }}
      {...other}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Button
          component={RouterLink}
          href={backLink}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
        >
          返回
        </Button>
        {currentBpmn._id && (
          <Typography variant="h4" sx={{ ml: 1 }}>
            标题: {currentBpmn.label}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          display: 'flex',
        }}
      >
        {currentBpmn._id && (
          <>
            <Button
              variant="contained"
              size="large"
              sx={{ ml: 2 }}
              color="warning"
              onClick={handleExecute}
            >
              执行流程
            </Button>
            <Button
              variant="contained"
              size="large"
              sx={{ ml: 2 }}
              color="error"
              onClick={handleOpenFormModal}
            >
              修改信息
            </Button>
          </>
        )}
        <Button variant="contained" size="large" sx={{ ml: 2 }} onClick={onUpload}>
          {!currentBpmn._id ? '创建' : '保存变更'}
        </Button>
      </Box>
    </Stack>
  );
  return (
    <>
      <Grid container spacing={3} sx={{ height: '100%' }}>
        {renderActions}
        <div className="bpmn-content" ref={containerRef}>
          <div className="canvas" ref={canvasRef} />
          <div className="properties-panel-parent" ref={propertiesRef} style={{ width: '350px' }} />
        </div>
      </Grid>
      <Dialog fullWidth maxWidth="xs" open={openForm} onClose={handleCloseFormModal}>
        <DialogTitle>{currentBpmn._id ? '编辑' : '新增'}</DialogTitle>
        <BpmnForm item={currentForm} onCancel={handleCloseFormModal} onSubmitData={onSave} />
      </Dialog>
    </>
  );
}

BpmnNewEditForm.propTypes = {
  currentBpmn: PropTypes.object,
  backLink: PropTypes.string,
  sx: PropTypes.object,
};
