import * as u from './utils'
import { deobfuscateExpression } from './expressions'
import { transformDeclaration } from './declarations'
import { inlineProcedure } from './call-expressions'
import { deobfuscateLoop } from './loops'

function Deobfuscator (babel) {
  return {
    VariableDeclaration: transformDeclaration,
    CallExpression (path) {
      inlineProcedure(path, babel.traverse)
    },
    Expression: {
      enter: deobfuscateExpression,
      exit (path) {
        deobfuscateExpression(path)

        if (path.parentPath.isVariableDeclarator() && u.hasValue(path.node)) {
          const binding = path.scope.getBinding(path.parent.id.name)
          if (binding && binding.constant) {
            binding.setValue(path.node.value)
          }
        }

        if (u.hasValue(path.node)) {
          path.skip()
        }
      }
    },
    Loop: {
      enter: deobfuscateLoop,
      exit: deobfuscateLoop
    }
    // DCE
    // , Scope: {
    //   exit (path) {
    //     Object.keys(path.scope.bindings)
    //       .map(key => path.scope.getBinding(key))
    //       .forEach(binding => {
    //         const declaration = binding.path.parentPath
    //         if (binding.constant && binding.hasValue && !binding.referenced && !declaration.removed) {
    //           declaration.remove()
    //         }
    //       })
    //   }
    // }
  }
}

export default function (babel) {
  return {
    name: 'deobfuscate',
    visitor: Deobfuscator(babel)
  }
}
