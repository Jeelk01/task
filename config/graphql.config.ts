export default () => ({
     graphql: {
          playground: process.env.GRAPHQL_PLAYGROUND === 'true' || false,
          introspection: process.env.GRAPHQL_INTROSPECTION === 'true' || false,
     }
})