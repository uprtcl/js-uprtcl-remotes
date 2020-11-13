import IPFS from 'ipfs';

import { EveesModule } from '@uprtcl/evees';
import { DocumentsModule } from '@uprtcl/documents';
import { WikisModule } from '@uprtcl/wikis';
import { EveesBlockchainModule } from '@uprtcl/evees-blockchain';
import { EveesOrbitDBModule } from '@uprtcl/evees-orbitdb';
import { EveesEthereumWrapper } from '@uprtcl/evees-ethereum';

import {
  MicroOrchestrator,
  i18nextBaseModule,
} from '@uprtcl/micro-orchestrator';
import { CortexModule } from '@uprtcl/cortex';
import { ApolloClientModule } from '@uprtcl/graphql';
import { DiscoveryModule } from '@uprtcl/multiplatform';
import { LensesModule } from '@uprtcl/lenses';

import { SimpleWiki } from './simple-wiki';
import { env } from '../env';

(async function () {
  const ipfsJSConfig = {
    preload: { enabled: false },
    relay: { enabled: true, hop: { enabled: true, active: true } },
    EXPERIMENTAL: { pubsub: true },
    config: {
      init: true,
      Addresses: {
        Swarm: env.pinner.Swarm,
      },
      Bootstrap: env.pinner.Bootstrap,
    },
  };

  const orchestrator = new MicroOrchestrator();

  const ipfs = await IPFS.create(ipfsJSConfig);

  const wrapper = new EveesEthereumWrapper(
    ipfs,
    env.ethers.provider,
    env.pinner
  );
  await wrapper.load();

  const evees = new EveesModule(wrapper.remotes);

  const documents = new DocumentsModule();
  const wikis = new WikisModule();

  const modules = [
    new i18nextBaseModule(),
    new ApolloClientModule(),
    new CortexModule(),
    new DiscoveryModule([wrapper.remotes[0].store.casID]),
    new LensesModule(),
    new EveesBlockchainModule(),
    new EveesOrbitDBModule(),
    evees,
    documents,
    wikis,
  ];

  await orchestrator.loadModules(modules);

  console.log(orchestrator);
  customElements.define('simple-wiki', SimpleWiki);
})();
