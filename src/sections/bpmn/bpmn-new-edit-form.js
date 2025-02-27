import { useEffect, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
// @mui
import Grid from '@mui/material/Unstable_Grid2';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';

// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { RouterLink } from 'src/routes/components';
import Stack from '@mui/material/Stack';

// bmpn
import BpmnModeler from 'bpmn-js/lib/Modeler';
import { CreateAppendAnythingModule } from 'bpmn-js-create-append-anything';
import {
  ElementTemplatesPropertiesProviderModule, // Camunda 7 Element Templates
  CloudElementTemplatesPropertiesProviderModule, // Camunda 8 Element Templates
} from 'bpmn-js-element-templates';
import ConnectorsExtensionModule from 'bpmn-js-connectors-extension';
import ElementTemplateChooserModule from '@bpmn-io/element-template-chooser';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  ZeebePropertiesProviderModule,
} from 'bpmn-js-properties-panel';
import MinimapModule from 'diagram-js-minimap';
import TokenSimulationModule from 'bpmn-js-token-simulation';
import TemplateIconRendererModule from '@bpmn-io/element-templates-icons-renderer';
import ZeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe.json';
import AddExporterModule from '@bpmn-io/add-exporter';
import ZeebeBehaviorModule from 'camunda-bpmn-js-behaviors/lib/camunda-cloud';
import gridModule from 'diagram-js-grid';
import { bpmnService } from 'src/composables/context-provider';
import zhCN from './resources/zn';
import TEMPLATES from './resources/template.json';
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
  return template.replace(/{([^}]+)}/g, (_, key) => replacements[key] || `{${key}}`);
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
  const [currnetForm, setCurrentForm] = useState({});
  const [openForm, setOpenForm] = useState(false);
  const handleOpenFormModal = () => {
    setOpenForm(true);
  };

  const onSave = async (form) => {
    setCurrentForm((prevForm) => ({
      ...prevForm,
      form,
    }));
    if (!currentBpmn._id) {
      try {
        await bpmnService.post(currnetForm);
        enqueueSnackbar('新增成功');
      } catch (e) {
        enqueueSnackbar(e.response.data.message);
      }
    }
    handleCloseFormModal();
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
        console.log('Awesome! Ready to navigate!');
      } catch (err) {
        console.error('Failed to load diagram:', err);
      }
    }
  }
  async function newDiagram(text) {
    if (bpmnModeler.current) {
      try {
        await bpmnModeler.current.importXML(text);
        console.log('Awesome! Ready to navigate!');
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
          MinimapModule,
          AddExporterModule,
          ConnectorsExtensionModule,
          ElementTemplatesPropertiesProviderModule,
          ZeebeBehaviorModule,
          ElementTemplateChooserModule,
          ZeebePropertiesProviderModule,
          CloudElementTemplatesPropertiesProviderModule,
          TemplateIconRendererModule,
          TokenSimulationModule,
          gridModule,
          translate,
          BpmnPropertiesPanelModule,
          BpmnPropertiesProviderModule,
        ],
        moddleExtensions: {
          zeebe: ZeebeModdle,
        },
        exporter: {
          name: 'bpmn-js-token-simulation',
          version: '0.37.0',
        },
        connectorsExtension: {
          appendAnything: true,
        },
      });
      bpmnModeler.current.get('elementTemplatesLoader').setTemplates(TEMPLATES);
      bpmnModeler.current.get('connectorsExtension').loadTemplates(TEMPLATES);
      if (currentBpmn.content && currentBpmn._id) {
        newDiagram(currentBpmn.content);
      } else {
        setCurrentForm(currentBpmn);
        openDiagram(diagramXML);
      }
    }
  }, [currentBpmn]);

  const onUpload = async () => {
    if (currentBpmn) {
      try {
        await bpmnService.put(currnetForm);
        enqueueSnackbar('修改成功');
      } catch (e) {
        enqueueSnackbar(e.response.data.message);
      }
    } else {
      handleOpenFormModal();
    }
  };
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
      <Button
        component={RouterLink}
        href={backLink}
        startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
      >
        返回
      </Button>
      <Box
        sx={{
          display: 'flex',
        }}
      >
        {currentBpmn._id && (
          <Button
            variant="contained"
            size="large"
            sx={{ ml: 2 }}
            color="error"
            onClick={handleOpenFormModal}
          >
            修改信息
          </Button>
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
        <BpmnForm item={currnetForm} onSubmitData={onSave} />
      </Dialog>
    </>
  );
}

BpmnNewEditForm.propTypes = {
  currentBpmn: PropTypes.object,
  backLink: PropTypes.string,
  sx: PropTypes.object,
};
