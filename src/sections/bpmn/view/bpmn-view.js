import { useEffect, useState, useCallback, useRef } from 'react';
// @mui
import Container from '@mui/material/Container';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
// components
import { useSettingsContext } from 'src/components/settings';

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
  // CloudElementTemplatesPropertiesProviderModule,
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
import TEMPLATES from './template.json';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import 'diagram-js-minimap/assets/diagram-js-minimap.css';
import '@bpmn-io/element-template-chooser/dist/element-template-chooser.css';
import '@bpmn-io/properties-panel/assets/properties-panel.css';
import 'bpmn-js-token-simulation/assets/css/bpmn-js-token-simulation.css';
import 'bpmn-js-connectors-extension/dist/connectors-extension.css';
import diagramXML from '../resources/pizza-collaboration.bpmn';
import './style.css';

export default function BpmnView() {
  const settings = useSettingsContext();
  const bpmnModeler = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const propertiesRef = useRef(null);

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
          // ElementTemplateChooserModule,
          ZeebePropertiesProviderModule,
          CloudElementTemplatesPropertiesProviderModule,
          TemplateIconRendererModule,
          TokenSimulationModule,
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
      openDiagram(diagramXML);
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'xl'}
      sx={{ height: 'calc(100vh - 220px)', pr: 0, mr: 0 }}
    >
      <CustomBreadcrumbs
        heading="流程管理"
        links={[
          {
            name: '',
          },
        ]}
      />
      <div className="bpmn-content" ref={containerRef}>
        <div className="canvas" ref={canvasRef} />
        <div className="properties-panel-parent" ref={propertiesRef} style={{ width: '350px' }} />
      </div>
    </Container>
  );
}
